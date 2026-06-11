import ProductCards from "../components/ProductCards";

export default function Products() {
  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
      <h2>Products</h2>
      <p>Browse product cards and open the PDFs.</p>
      <ProductCards />
    </div>
  );
}
