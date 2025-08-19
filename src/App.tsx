import { BrowserRouter } from "react-router-dom";
import { useSettings } from "./context/SettingsContext";
import { Toaster } from "react-hot-toast";
import AppRoutes from "./routes/AppRoutes";
import { useEffect } from "react";
import { useLanguage } from "./context/LanguageContext";

export default function App() {
  const { settings } = useSettings();
  const { currentLang } = useLanguage();

  useEffect(() => {
    document.title =
      currentLang === "ar"
        ? settings.site_name_ar
        : settings.site_name || "Admin Dashboard";
  }, [settings.site_name]);

  useEffect(() => {
    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === "ar" ? "rtl" : "ltr";
  }, [currentLang]);

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
