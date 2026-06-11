import { useState, useEffect } from "react";
import styles from "./NewOrder.module.css";

export default function NewOrder() {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  // ids rather than names
  const [customerId, setCustomerId] = useState("");
  const [items, setItems] = useState([{ productId: "", quantity: 1 }]);

  // loading flags
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Load customers and products from the API
  useEffect(() => {
    async function loadData() {
      try {
        const [customersRes, productsRes] = await Promise.all([
          fetch("/api/customers"),
          fetch("/api/products")
        ]);

        const customersJson = await customersRes.json();
        const productsJson = await productsRes.json();

        // tweak these lines if your handlers change shape
        setCustomers(customersJson.customers || []);
        setProducts(productsJson.productDetails || productsJson.products || []);
      } catch (err) {
        console.error("Failed to load data for NewOrder form", err);
      } finally {
        setLoadingData(false);
      }
    }

    loadData();
  }, []);

  function updateItem(index, field, value) {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  }

  function addItem() {
    setItems([...items, { productId: "", quantity: 1 }]);
  }

  function removeItem(index) {
    setItems(items.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const cleanedItems = items
      .filter(i => i.productId && i.quantity > 0)
      .map(i => ({
        productId: Number(i.productId),
        quantity: Number(i.quantity)
      }));

    if (!customerId || cleanedItems.length === 0) {
      alert("Pick a customer and at least one item");
      return;
    }

    const payload = {
      customerId: Number(customerId),
      items: cleanedItems
    };

    try {
      setSubmitting(true);

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.error("API error", res.status, text);
        throw new Error("API error");
      }

      alert("Order created");
      setCustomerId("");
      setItems([{ productId: "", quantity: 1 }]);
    } catch (err) {
      console.error(err);
      alert("Failed to create order");
    } finally {
      setSubmitting(false);
    }
  }

  // disable inputs while loading or submitting
  const formDisabled = loadingData || submitting;

  // extra validation flags for the submit button
  const hasCustomer = Boolean(customerId);
  const hasItem = items.some(i => i.productId && i.quantity > 0);
  const canSubmit = !loadingData && !submitting && hasCustomer && hasItem;

  return (
    <div className={styles.wrap}>
      <h2>New Order</h2>
      <p>Create a new customer order.</p>

      {loadingData && (
        <p className={styles.loading}>Loading customers and products…</p>
      )}
      {submitting && !loadingData && (
        <p className={styles.loading}>Sending your order…</p>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <label>
          Customer
          <select
            value={customerId}
            onChange={e => setCustomerId(e.target.value)}
            required
            disabled={formDisabled}
          >
            <option value="">Select customer</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <div className={styles.items}>
          <h4>Order items</h4>

          {items.map((item, index) => (
            <div key={index} className={styles.itemRow}>
              <select
                value={item.productId}
                onChange={e =>
                  updateItem(index, "productId", e.target.value)
                }
                required
                disabled={formDisabled}
              >
                <option value="">Product</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>

              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={e =>
                  updateItem(index, "quantity", Number(e.target.value))
                }
                disabled={formDisabled}
              />

              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className={styles.remove}
                  disabled={formDisabled}
                >
                  ✖
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addItem}
            className={styles.add}
            disabled={formDisabled}
          >
            + Add another item
          </button>
        </div>

        <button
          type="submit"
          className={styles.submit}
          disabled={!canSubmit}
        >
          {submitting ? "Creating…" : "Create order"}
        </button>
      </form>
    </div>
  );
}
