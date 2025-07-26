import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import ProductsPage from "../pages/dashboard/ProductsPage";
import CategoriesPage from "../pages/dashboard/CategoriesPage";
import OrdersPage from "../pages/dashboard/OrdersPage";
import CustomersPage from "../pages/dashboard/CustomersPage";
import SettingsPage from "../pages/dashboard/SettingsPage";
import ProtectedRoute from "./ProtectedRoute";
import MainLayout from "../layouts/MainLayout";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public route */}
      <Route path='/login' element={<LoginPage />} />

      {/* Redirect root to dashboard */}
      <Route path='/' element={<Navigate to='/dashboard' replace />} />

      {/* Protected Dashboard Routes */}
      <Route
        path='/dashboard'
        element={
          <ProtectedRoute allowedRoles={["admin", "user"]}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route
          path='settings'
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path='orders'
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path='products'
          element={
            <ProtectedRoute allowedRoles={["admin", "user"]}>
              <ProductsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path='customers'
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <CustomersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path='categories'
          element={
            <ProtectedRoute allowedRoles={["admin", "user"]}>
              <CategoriesPage />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}
