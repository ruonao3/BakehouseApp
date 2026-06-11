// functions/utility-functions.js
import { runQuery, bootstrapDatabase } from "./db.js";
import {
  slugifyName,
  generateAndUploadProductPdf,
} from './pdf-utils.js'

// Small helper to keep responses consistent
function jsonResponse(statusCode, payload) {
  return {
    statusCode,
    body: JSON.stringify(payload)
  };
}

// Normalise the result from data-api-client / RDS Data API
const normaliseRows = (result) => {
  if (!result) return []
  if (Array.isArray(result)) return result
  if (Array.isArray(result.rows)) return result.rows
  if (Array.isArray(result.records)) return result.records
  return []
}

const logInvocationDetails = (event, context) => {
  console.log("Event received:");
  console.log(JSON.stringify(event, null, 2));

  if (context) {
    console.log("Context received:");
    console.log({
      functionName: context.functionName,
      functionVersion: context.functionVersion,
      awsRequestId: context.awsRequestId,
      remainingTimeMs: context.getRemainingTimeInMillis()
    });
  }
};

// -------------------------
// BOOTSTRAP HANDLER
// -------------------------
export const bootstrapHandler = async (event, context) => {
  logInvocationDetails(event, context);

  try {
    const code = await bootstrapDatabase();

    return jsonResponse(code, {
      status: "ok",
      message: "Database reset and seeded with sample bakehouse data"
    });
  } catch (err) {
    console.error("bootstrapHandler error:", err);

    return jsonResponse(500, {
      status: "error",
      message: "Failed to bootstrap database"
    });
  }
};

// -------------------------
// PRODUCTS
// -------------------------
export const productsListHandler = async (event, context) => {
  logInvocationDetails(event, context)

  try {
    const result = await runQuery(`
      SELECT id, name, description, price_pence, pdf_url
      FROM products
      WHERE pdf_url IS NOT NULL
      ORDER BY name;
    `)

    const rows = normaliseRows(result)

    // Use the pdf_url to derive the slug the front end expects
    const productObjects = rows.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      pricePence: r.price_pence,
      pdfUrl: r.pdf_url,
      slug: r.pdf_url.replace(/\.pdf$/i, '')
    }))

    const productSlugs = productObjects.map((p) => p.slug)

    return {
      statusCode: 200,
      body: JSON.stringify({
        status: 'ok',
        featuredProduct: process.env.FEATURED_PRODUCT || null,
        products: productSlugs,        // what the UI already uses
        productDetails: productObjects // extra data if you need it later
      })
    }
  } catch (error) {
    console.error('productsListHandler error:', error)

    return {
      statusCode: 500,
      body: JSON.stringify({
        status: 'error',
        message: 'Failed to load products'
      })
    }
  }
}

export const postProductHandler = async (event) => {
  console.log('postProductsHandler invoked')

  const body = event.body ? JSON.parse(event.body) : {}

  // support either pricePounds (our preferred shape) or price
  const rawPrice =
    typeof body.pricePounds === 'number'
      ? body.pricePounds
      : Number(body.price)

  if (!body.name || !Number.isFinite(rawPrice)) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        status: 'error',
        message: 'name and pricePounds (number) are required',
      }),
    }
  }

  const name = body.name
  const description = body.description || ''
  const category = body.category || 'Uncategorised'
  const price_pence = Math.round(rawPrice * 100)

  try {
    // 1. Generate and upload the PDF
    //    This returns { key, url } where key is e.g. "chocolate_brownie.pdf"
    const { key: pdfKey } = await generateAndUploadProductPdf({
      name,
      category,
      price_pence,
    })

    // 2. Insert product row, storing ONLY the key in pdf_url
    const insertSql = `
      INSERT INTO products (name, description, price_pence, pdf_url)
      VALUES (:name, :description, :price_pence, :pdf_url)
      RETURNING id, name, description, price_pence, pdf_url
    `

    const insertResult = await runQuery(insertSql, {
      name,
      description,
      price_pence,
      pdf_url: pdfKey,
    })

    const row =
      insertResult?.records?.[0] ||
      insertResult?.rows?.[0] ||
      insertResult?.[0]

    const product = {
      id: row.id,
      name: row.name,
      description: row.description,
      price_pence: row.price_pence,
      category,
      pdf_url: pdfKey, // keep key here, not full URL
    }

    return {
      statusCode: 201,
      body: JSON.stringify({
        status: 'created',
        product,
      }),
    }
  } catch (error) {
    console.error('Error creating product', error)

    return {
      statusCode: 500,
      body: JSON.stringify({
        status: 'error',
        message: 'Could not create product',
      }),
    }
  }
}

// -------------------------
// CUSTOMERS
// -------------------------
export const getCustomersHandler = async (event, context) => {
  logInvocationDetails(event, context);

  try {
    const result = await runQuery(
      `
      SELECT
        c.id,
        c.name,
        c.email,
        COUNT(o.id) AS orders
      FROM customers c
      LEFT JOIN orders o
        ON o.customer_id = c.id
      GROUP BY c.id, c.name, c.email
      ORDER BY c.name ASC;      
      `
    );

    const records = result.records || [];

    const customers = records.map(r => ({
      id: r.id,
      name: r.name,
      email: r.email,
      orders: Number(r.orders || 0)
    }));

    return jsonResponse(200, {
      status: "ok",
      customers
    });
  } catch (err) {
    console.error("getCustomersHandler error:", err);

    return jsonResponse(500, {
      status: "error",
      message: "Could not load customers"
    });
  }
};

export const postCustomersHandler = async event => {
  console.log("postCustomersHandler invoked");

  try {
    const body = event.body ? JSON.parse(event.body) : {};

    const name = body.name?.trim();
    const email = body.email?.trim();

    if (!name || !email) {
      return jsonResponse(400, {
        status: "error",
        message: "Name and email are required"
      });
    }

    const result = await runQuery(
      `
      INSERT INTO customers (name, email)
      VALUES (:name, :email)
      ON CONFLICT (email) DO NOTHING
      RETURNING id, name, email;
      `,
      { name, email }
    );

    const created =
      (result.records && result.records[0]) || { name, email, note: "already existed" };

    return jsonResponse(201, {
      status: "created",
      customer: created
    });
  } catch (err) {
    console.error("postCustomersHandler error:", err);

    return jsonResponse(500, {
      status: "error",
      message: "Could not create customer"
    });
  }
};

// -------------------------
// ORDERS
// -------------------------

export const getOrdersHandler = async (event, context) => {
  logInvocationDetails(event, context)

  try {
    const result = await runQuery(`
      SELECT
        o.id,
        o.quantity,
        o.order_status,
        o.created_at,
        c.name AS customer_name,
        p.name AS product_name
      FROM orders o
      JOIN customers c ON c.id = o.customer_id
      JOIN products  p ON p.id = o.product_id
      ORDER BY o.created_at DESC;
    `)

    // Cope with the different shapes data-api-client might return
    const rows =
      (result && result.rows) ||
      (result && result.records) ||
      []

    const orders = rows.map((r) => ({
      id: r.id,
      customer: r.customer_name,
      status: r.order_status,
      items: [
        {
          product: r.product_name,
          quantity: r.quantity
        }
      ],
      createdAt: r.created_at
    }))

    console.log('Loaded orders from DB:', orders.length)

    return {
      statusCode: 200,
      body: JSON.stringify({
        status: 'ok',
        orders
      })
    }
  } catch (error) {
    console.error('getOrdersHandler error:', error)

    return {
      statusCode: 500,
      body: JSON.stringify({
        status: 'error',
        message: 'Failed to load orders'
      })
    }
  }
}

export const postOrdersHandler = async (event) => {
  console.log("postOrdersHandler invoked");

  let body;
  try {
    body = event.body ? JSON.parse(event.body) : {};
  } catch (err) {
    console.error("Failed to parse body", err);
    return {
      statusCode: 400,
      body: JSON.stringify({
        status: "error",
        message: "Invalid JSON body"
      })
    };
  }

  const { customerId, items } = body;

  // Basic validation
  if (!customerId || !Array.isArray(items) || items.length === 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        status: "error",
        message: "Customer and at least one item are required"
      })
    };
  }

  // Clean and coerce values
  const cleanedItems = items
    .filter(i => i.productId && i.quantity > 0)
    .map(i => ({
      productId: Number(i.productId),
      quantity: Number(i.quantity) || 1
    }));

  if (cleanedItems.length === 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        status: "error",
        message: "No valid order items supplied"
      })
    };
  }

  try {
    // We will insert one row per item in the orders table
    // orders: id, customer_id, product_id, quantity, order_status, created_at

    const valuesSql = cleanedItems
      .map((_, idx) =>
        `(:customerId, :product_id_${idx}, :quantity_${idx}, 'PLACED')`
      )
      .join(", ");

    const sql = `
      INSERT INTO orders (customer_id, product_id, quantity, order_status)
      VALUES ${valuesSql}
      RETURNING id, customer_id, product_id, quantity, order_status, created_at
    `;

    const params = { customerId: Number(customerId) };
    cleanedItems.forEach((item, idx) => {
      params[`product_id_${idx}`] = item.productId;
      params[`quantity_${idx}`] = item.quantity;
    });

    const result = await runQuery(sql, params);
    const rows = normaliseRows(result);

    return {
      statusCode: 201,
      body: JSON.stringify({
        status: "created",
        orders: rows
      })
    };
  } catch (err) {
    console.error("Error creating order", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        status: "error",
        message: "Could not create order"
      })
    };
  }
};

// -------------------------
// BAD LAMBDA (ERROR DEMO)
// -------------------------
export const badHandler = async event => {
  console.log("badHandler invoked");

  try {
    throw new Error("DB call failed - connection timeout");
  } catch (error) {
    console.error("REAL ERROR:", error);

    return jsonResponse(500, {
      message: "Please try again later"
    });
  }
};
