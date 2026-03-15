import { Route, Routes } from "react-router-dom";
import PublicRedirect from "../components/PublicRedirect";
import UserRedirect from "../components/UserRedirect";
import ClientLayout from "../layouts/ClientLayout";
import MainLayout from "../layouts/MainLayout";
import EmailConfirmationPage from "../pages/auth/EmailConfirmation";
import ForgotPasswordPage from "../pages/auth/ForgotPassword";
import LoginPage from "../pages/auth/Login";
import NotFoundPage from "../pages/auth/NotFound";
import RegisterPage from "../pages/auth/Register";
import ResetPasswordPage from "../pages/auth/ResetPassword";
import UnauthorizedPage from "../pages/auth/Unauthorized";
import HomePage from "../pages/client/HomePage";
import CartPage from "../pages/client/CartPage";
import CatalogRoot from "../pages/dashboard/catalog/CatalogRoot";
import ProductPage from "../pages/client/ProductPage";
import ProductsListingPage from "../pages/client/ProductsListingPage";
import CategoriesRoot from "../pages/dashboard/categories/CategoriesRoot";
import CustomersRoot from "../pages/dashboard/customers/CustomersRoot";
import DashboardRoot from "../pages/dashboard/DashboardRoot";
import EmployeesRoot from "../pages/dashboard/employees/EmployeesRoot";
import OrdersRoot from "../pages/dashboard/orders/OrdersRoot";
import ProductsRoot from "../pages/dashboard/products/ProductsRoot";
import ReviewsRoot from "../pages/dashboard/reviews/ReviewsRoot";
import SettingsRoot from "../pages/dashboard/settings/SettingsRoot";
import { UserRole } from "../types";
import ProtectedRoute from "./ProtectedRoute";
import AboutPage from "../pages/client/AboutPage";
import ContactPage from "../pages/client/ContactPage";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public route */}
      <Route path='/login' element={<LoginPage />} />
      <Route path='/signup' element={<RegisterPage />} />
      <Route path='/emailConfirmation' element={<EmailConfirmationPage />} />
      <Route path='/forgot-password' element={<ForgotPasswordPage />} />
      <Route path='/reset-password' element={<ResetPasswordPage />} />
      <Route path='/unauthorized' element={<UnauthorizedPage />} />

      {/* User redirect route - checks user type and redirects accordingly */}
      <Route path='/redirect' element={<UserRedirect />} />

      {/* Root route - checks if user is authenticated and redirects accordingly */}
      <Route path='/home' element={<PublicRedirect />} />

      {/* Client Routes - Public access (Home page) */}
      <Route path='/' element={<ClientLayout />}>
        <Route index element={<HomePage />} />
        <Route path='products' element={<ProductsListingPage />} />
        <Route path='cart' element={<CartPage />} />
        <Route path='about' element={<AboutPage />} />
        <Route path='contact' element={<ContactPage />} />
        <Route
          path='favorites'
          element={<div>Favorites Page - Coming Soon</div>}
        />
        <Route path='orders' element={<div>Orders Page - Coming Soon</div>} />
        <Route path='account' element={<div>Account Page - Coming Soon</div>} />
        <Route path='help' element={<div>Help Page - Coming Soon</div>} />
        <Route path='search' element={<ProductsListingPage />} />
        <Route path=':slug' element={<ProductPage />} />
      </Route>

      {/* Protected Dashboard Routes */}
      <Route
        path='/dashboard'
        element={
          <ProtectedRoute allowedRoles={[UserRole.Admin, UserRole.Employee]}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardRoot />} />
        <Route
          path='/dashboard/employees'
          element={
            <ProtectedRoute allowedRoles={[UserRole.Admin, UserRole.Employee]}>
              <EmployeesRoot />
            </ProtectedRoute>
          }
        />
        <Route
          path='/dashboard/settings'
          element={
            <ProtectedRoute allowedRoles={[UserRole.Admin]}>
              <SettingsRoot />
            </ProtectedRoute>
          }
        />
        <Route
          path='/dashboard/orders'
          element={
            <ProtectedRoute allowedRoles={[UserRole.Admin]}>
              <OrdersRoot />
            </ProtectedRoute>
          }
        />
        <Route
          path='/dashboard/products'
          element={
            <ProtectedRoute allowedRoles={[UserRole.Admin, UserRole.Employee]}>
              <ProductsRoot />
            </ProtectedRoute>
          }
        />
        <Route
          path='/dashboard/customers'
          element={
            <ProtectedRoute allowedRoles={[UserRole.Admin]}>
              <CustomersRoot />
            </ProtectedRoute>
          }
        />
        <Route
          path='/dashboard/categories'
          element={
            <ProtectedRoute allowedRoles={[UserRole.Admin, UserRole.Employee]}>
              <CategoriesRoot />
            </ProtectedRoute>
          }
        />
        <Route
          path='/dashboard/items'
          element={
            <ProtectedRoute allowedRoles={[UserRole.Admin, UserRole.Employee]}>
              <CatalogRoot />
            </ProtectedRoute>
          }
        />
        <Route
          path='/dashboard/reviews'
          element={
            <ProtectedRoute allowedRoles={[UserRole.Admin]}>
              <ReviewsRoot />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Catch-all route for 404 */}
      <Route path='*' element={<NotFoundPage />} />
    </Routes>
  );
}
