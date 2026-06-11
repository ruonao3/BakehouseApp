import { NavLink, Outlet } from "react-router-dom";
import styles from "./Layout.module.css";

const tabs = [
  { to: "/", label: "Home", end: true },
  { to: "/products", label: "Products" },
  { to: "/products/new", label: "New Product" },
  { to: "/customers", label: "Customer List" },
  { to: "/customers/new", label: "New Customer" },
  { to: "/orders", label: "Order List" },
  { to: "/orders/new", label: "New Order" }
];

export default function Layout() {
    const stackName = import.meta.env.VITE_STACK_NAME ?? "Bakehouse"
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.brand}>{stackName} demo app</div>

        <nav className={styles.nav}>
          {tabs.map(tab => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                isActive ? `${styles.tab} ${styles.active}` : styles.tab
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
