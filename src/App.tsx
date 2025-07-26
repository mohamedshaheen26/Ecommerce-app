import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/DashboardLayout";
import DashboardPage from "./pages/dashboard/DashboardPage";
import ProductsPage from "./pages/dashboard/ProductsPage";
import CategoriesPage from "./pages/dashboard/CategoriesPage";
import OrdersPage from "./pages/dashboard/OrdersPage";
import CustomersPage from "./pages/dashboard/CustomersPage";
import { AuthProvider } from "./context/AuthContext";
import { SettingsProvider, useSettings } from "./context/SettingsContext";
import SettingsPage from "./pages/dashboard/SettingsPage";
import { Toaster } from 'react-hot-toast';
import ReviewsPage from "./pages/dashboard/ReviewsPage";
import AppRoutes from "./routes/AppRoutes";
import { useEffect } from "react";

export default function App() {
  const { settings } = useSettings();

  useEffect(() => {
    document.title = settings.siteName || "Admin Dashboard";
  }, [settings.siteName]);

  return (
    <BrowserRouter>
      <AppRoutes />
      <Toaster
        position='top-right'
        toastOptions={{
          duration: 3000,
          style: { background: "#333", color: "#fff" },
          success: { style: { background: "#059669" } },
          error: { style: { background: "#DC2626" }, duration: 5000 },
        }}
      />
    </BrowserRouter>
  );
}
