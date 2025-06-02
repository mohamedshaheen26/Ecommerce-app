import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/DashboardLayout";
import DashboardPage from "./pages/dashboard/DashboardPage";
import ProductsPage from "./pages/dashboard/ProductsPage";
import CategoriesPage from "./pages/dashboard/CategoriesPage";
import OrdersPage from "./pages/dashboard/OrdersPage";
import CustomersPage from "./pages/dashboard/CustomersPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protected routes */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Dashboard routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<DashboardPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="customers" element={<CustomersPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
