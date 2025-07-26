import { BrowserRouter } from "react-router-dom";
import { useSettings } from "./context/SettingsContext";
import { Toaster } from "react-hot-toast";
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
