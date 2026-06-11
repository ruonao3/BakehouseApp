import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./layout/Layout";

import Home from "./pages/Home";
import Products from "./pages/Products";
import NewProduct from "./pages/NewProduct";
import Customers from "./pages/Customers";
import NewCustomer from "./pages/NewCustomer";
import Orders from "./pages/Orders";
import NewOrder from "./pages/NewOrder";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/new" element={<NewProduct />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/customers/new" element={<NewCustomer />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/new" element={<NewOrder />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
