import { Routes, Route } from "react-router-dom";
import LoginPage from "../pages/auth/Login";
import ProtectedRoute from "./ProtectedRoute";
import MainLayout from "../layouts/MainLayout";
import CategoriesRoot from "../pages/dashboard/categories/CategoriesRoot";
import CustomersRoot from "../pages/dashboard/customers/CustomersRoot";
import OrdersRoot from "../pages/dashboard/orders/OrdersRoot";
import SettingsRoot from "../pages/dashboard/settings/SettingsRoot";
import DashboardRoot from "../pages/dashboard/DashboardRoot";
import ProductsRoot from "../pages/dashboard/products/ProductsRoot";
import EmployeesRoot from "../pages/dashboard/employees/EmployeesRoot";
import { UserRole } from "../types";
import UnauthorizedPage from "../pages/auth/Unauthorized";
import ReviewsRoot from "../pages/dashboard/reviews/ReviewsRoot";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public route */}
      <Route path='/login' element={<LoginPage />} />
      <Route path='/unauthorized' element={<UnauthorizedPage />} />

      {/* Protected Dashboard Routes */}
      <Route
        path='/'
        element={
          <ProtectedRoute allowedRoles={[UserRole.Admin, UserRole.Employee]}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardRoot />} />
        <Route
          path='employees'
          element={
            <ProtectedRoute allowedRoles={[UserRole.Admin, UserRole.Employee]}>
              <EmployeesRoot />
            </ProtectedRoute>
          }
        />
        <Route
          path='settings'
          element={
            <ProtectedRoute allowedRoles={[UserRole.Admin]}>
              <SettingsRoot />
            </ProtectedRoute>
          }
        />
        <Route
          path='orders'
          element={
            <ProtectedRoute allowedRoles={[UserRole.Admin]}>
              <OrdersRoot />
            </ProtectedRoute>
          }
        />
        <Route
          path='products'
          element={
            <ProtectedRoute allowedRoles={[UserRole.Admin, UserRole.Employee]}>
              <ProductsRoot />
            </ProtectedRoute>
          }
        />
        <Route
          path='customers'
          element={
            <ProtectedRoute allowedRoles={[UserRole.Admin]}>
              <CustomersRoot />
            </ProtectedRoute>
          }
        />
        <Route
          path='categories'
          element={
            <ProtectedRoute allowedRoles={[UserRole.Admin, UserRole.Employee]}>
              <CategoriesRoot />
            </ProtectedRoute>
          }
        />
        <Route
          path='reviews'
          element={
            <ProtectedRoute allowedRoles={[UserRole.Admin]}>
              <ReviewsRoot />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}
