import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { BrowserRouter, useLocation } from "react-router-dom";
import { useLanguage } from "./context/LanguageContext";
import { useSettings } from "./context/SettingsContext";
import AppRoutes from "./routes/AppRoutes";
import { getBreadcrumbs } from "./utils/getBreadcrumbs";

function AppContent() {
  const { settings } = useSettings();
  const { currentLang } = useLanguage();
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [location.pathname]);

  useEffect(() => {
    const breadcrumbs = getBreadcrumbs();
    document.title = t(
      location.pathname === "/"
        ? currentLang === "ar"
          ? settings.site_name_ar
          : settings.site_name
        : breadcrumbs[0]?.name || "App",
    );
  }, [location, t, settings.site_name]);

  useEffect(() => {
    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === "ar" ? "rtl" : "ltr";
  }, [currentLang]);

  return (
    <>
      <AppRoutes />
      <Toaster
        position='top-right'
        containerStyle={{ top: "100px" }}
        toastOptions={{
          duration: 2000,
          style: { background: "#333", color: "#fff" },
          success: { style: { background: `var(--success)` } },
          error: { style: { background: `var(--error)` }, duration: 4000 },
        }}
      />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
