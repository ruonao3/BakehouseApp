// functions/pdf-utils.js

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { PDFDocument, StandardFonts } from 'pdf-lib'

// One shared S3 client per Lambda container
const s3 = new S3Client({})

// These are injected from CDK on the Lambda
const productCardsBucket = process.env.PRODUCT_CARDS_BUCKET
const productCardsBaseUrl = process.env.PRODUCT_CARDS_BASE_URL || ''
const awsRegion = process.env.AWS_REGION || 'eu-west-2'

/**
 * Turn a product name into a safe file name, e.g.
 * "Chocolate Brownie" -> "chocolate_brownie"
 */
export function slugifyName (name) {
  return (name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

/**
 * Build a simple one page PDF for a product.
 * Returns a Uint8Array of the PDF bytes.
 */
export async function createProductCardPdf (product) {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

  const { width, height } = page.getSize()
  const titleSize = 18
  const bodySize = 12
  let y = height - 60

  page.drawText('Bakehouse product card', {
    x: 50,
    y,
    size: titleSize,
    font
  })

  y -= 40
  page.drawText(`Name: ${product.name}`, {
    x: 50,
    y,
    size: bodySize,
    font
  })

  y -= 20
  page.drawText(`Category: ${product.category || 'N/A'}`, {
    x: 50,
    y,
    size: bodySize,
    font
  })

  y -= 20
  const pricePounds = ((product.price_pence || 0) / 100).toFixed(2)
  page.drawText(`Price: £${pricePounds}`, {
    x: 50,
    y,
    size: bodySize,
    font
  })

  // Returns Uint8Array
  return pdfDoc.save()
}

/**
 * Upload a PDF to the product cards bucket under the given key.
 * Key should normally look like: "chocolate_brownie.pdf"
 *
 * Returns:
 *   { key, url }
 *
 * You should store **key** in the database (e.g. pdf_url column),
 * and let the front end build the full URL from the bucket / domain.
 */
export async function uploadProductPdf (key, pdfBytes) {
  if (!productCardsBucket) {
    throw new Error('PRODUCT_CARDS_BUCKET env var is not set')
  }

  await s3.send(
    new PutObjectCommand({
      Bucket: productCardsBucket,
      Key: key,
      Body: Buffer.from(pdfBytes),
      ContentType: 'application/pdf'
    })
  )

  const url = productCardsBaseUrl
    ? `${productCardsBaseUrl}/${key}`
    : `https://${productCardsBucket}.s3.${awsRegion}.amazonaws.com/${key}`

  return { key, url }
}

/**
 * Convenience helper: generate a PDF for the product and upload it.
 *
 * Returns:
 *   { key, url }
 *
 * In your Lambda that creates a product, you will typically do:
 *
 *   const { key } = await generateAndUploadProductPdf(newProduct)
 *   await runQuery(
 *     'INSERT INTO products (...) VALUES (...) RETURNING *',
 *     { pdf_url: key }
 *   )
 */
export async function generateAndUploadProductPdf (product) {
  const slug = slugifyName(product.name || 'product')
  const key = `${slug}.pdf`

  const pdfBytes = await createProductCardPdf(product)
  const { url } = await uploadProductPdf(key, pdfBytes)

  return { key, url }
}
