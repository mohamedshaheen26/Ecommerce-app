import { BrowserRouter, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import AppRoutes from "./routes/AppRoutes";
import { useEffect } from "react";
import { useLanguage } from "./context/LanguageContext";
import { getBreadcrumbs } from "./utils/getBreadcrumbs";
import { useTranslation } from "react-i18next";

function AppContent() {
  const { currentLang } = useLanguage();
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    const breadcrumbs = getBreadcrumbs();
    document.title = t(
      location.pathname === "/" ? "Dashboard" : breadcrumbs[0]?.name || "App"
    );
  }, [location, t]);

  useEffect(() => {
    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === "ar" ? "rtl" : "ltr";
  }, [currentLang]);

  return (
    <>
      <AppRoutes />
      <Toaster
        position='top-right'
        containerStyle={{ top: "60px" }}
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
