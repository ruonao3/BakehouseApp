// import styles from "./ProductCards.module.css";

// const files = [
//   "blueberry_muffin.pdf",
//   "butter_croissant.pdf",
//   "chocolate_brownie.pdf",
//   "cinnamon_bun.pdf",
//   "french_baguette.pdf",
//   "pain_au_chocolat.pdf",
//   "sausage_roll.pdf",
//   "sourdough_loaf.pdf",
//   "vegan_banana_bread.pdf",
//   "victoria_sponge_slice.pdf"
// ];

// function toTitle(filename) {
//   return filename
//     .replace(".pdf", "")
//     .split("_")
//     .map(w => w.charAt(0).toUpperCase() + w.slice(1))
//     .join(" ");
// }

// export default function ProductCards() {
//   const baseUrl = import.meta.env.VITE_PRODUCT_CARDS_DOMAIN;

//   return (
//     <div className={styles.wrap}>
//       <div className={styles.grid}>
//         {files.map(f => (
//           <div key={f} className={styles.card}>
//             <div className={styles.name}>{toTitle(f)}</div>

//             <a
//               className={styles.link}
//               href={`${baseUrl}/${f}`}
//               target="_blank"
//               rel="noreferrer"
//             >
//               View PDF
//             </a>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }



import { useEffect, useState } from "react"
import styles from "./ProductCards.module.css"

function toTitle(product) {
  return product
    .split("_")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}

export default function ProductCards() {
  const baseUrl = import.meta.env.VITE_PRODUCT_CARDS_DOMAIN
  const [products, setProducts] = useState([])
  const [status, setStatus] = useState("loading")

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch(`/api/products`)

        if (!response.ok) {
          throw new Error("API error")
        }

        const data = await response.json()
        setProducts(data.products)
        setStatus("ready")
      } catch {
        setStatus("error")
      }
    }

    loadProducts()
  }, [])

  if (status === "loading") {
    return <div className={styles.wrap}>Loading products…</div>
  }

  if (status === "error") {
    return <div className={styles.wrap}>Failed to load products</div>
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.grid}>
        {products.map(product => {
          const filename = `${product}.pdf`

          return (
            <div key={product} className={styles.card}>
              <div className={styles.name}>{toTitle(product)}</div>

              <a
                className={styles.link}
                href={`${baseUrl}/${filename}`}
                target="_blank"
                rel="noreferrer"
              >
                View PDF
              </a>
            </div>
          )
        })}
      </div>
    </div>
  )
}
