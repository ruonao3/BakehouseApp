// import styles from "./Orders.module.css";

// const orders = [
//     {
//       id: "o1001",
//       customer: "Alice Baker",
//       status: "Processing",
//       items: [
//         { product: "Chocolate Brownie", quantity: 3 },
//         { product: "Cinnamon Bun", quantity: 2 }
//       ]
//     },
//     {
//       id: "o1002",
//       customer: "Tom Crust",
//       status: "Completed",
//       items: [
//         { product: "Sourdough Loaf", quantity: 1 }
//       ]
//     },
//     {
//       id: "o1003",
//       customer: "Sarah Dough",
//       status: "Pending",
//       items: [
//         { product: "French Baguette", quantity: 2 },
//         { product: "Pain Au Chocolat", quantity: 4 }
//       ]
//     }
//   ];

// export default function Orders() {
//   return (
//     <div className={styles.wrap}>
//         <h2>Order List</h2>
//         <p>All customer orders.</p>

//         <table className={styles.table}>
//             <thead>
//                 <tr>
//                     <th>Order ID</th>
//                     <th>Customer</th>
//                     <th>Items</th>
//                     <th>Status</th>
//                 </tr>
//             </thead>

//             <tbody>
//                 {orders.map(o => (
//                     <tr key={o.id}>
//                     <td>{o.id}</td>
//                     <td>{o.customer}</td>

//                     <td>
//                         <ul className={styles.items}>
//                         {o.items.map((item, idx) => (
//                             <li key={idx}>
//                             {item.product} × {item.quantity}
//                             </li>
//                         ))}
//                         </ul>
//                     </td>

//                     <td>
//                         <span
//                         className={`${styles.status} ${styles[o.status.toLowerCase()]}`}
//                         >
//                         {o.status}
//                         </span>
//                     </td>
//                     </tr>
//                 ))}
//             </tbody>

//         </table>
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import styles from "./Orders.module.css";

export default function Orders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/orders");
      const data = await res.json();
      setOrders(data.orders || []);
    }

    load();
  }, []);

  return (
    <div className={styles.wrap}>
      <h2>Order List</h2>
      <p>All customer orders.</p>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Items</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {orders.map(o => (
            <tr key={o.id}>
              <td>{o.id}</td>
              <td>{o.customer}</td>

              <td>
                <ul className={styles.items}>
                  {o.items.map((item, idx) => (
                    <li key={idx}>
                      {item.product} × {item.quantity}
                    </li>
                  ))}
                </ul>
              </td>

              <td>
                <span
                  className={`${styles.status} ${styles[o.status.toLowerCase()]}`}
                >
                  {o.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
