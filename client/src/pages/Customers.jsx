import { useEffect, useState } from "react";
import styles from "./Customers.module.css";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    async function loadCustomers() {
      try {
        const response = await fetch("/api/customers");

        if (!response.ok) {
          throw new Error("API error");
        }

        const data = await response.json();
        setCustomers(data.customers);
        setStatus("loaded");
      } catch {
        setStatus("error");
      }
    }

    loadCustomers();
  }, []);

  return (
    <div className={styles.wrap}>
      <h2>Customer List</h2>
      <p>All registered customers.</p>

      {status === "loading" && <p>Loading customers…</p>}
      {status === "error" && <p>Could not load customers</p>}

      {status === "loaded" && (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Orders</th>
            </tr>
          </thead>

          <tbody>
            {customers.map(c => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.name}</td>
                <td>{c.email}</td>
                <td>{c.orders}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
