import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { SettingsProvider } from "./context/SettingsContext";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import { LanguageProvider } from "./context/LanguageContext.tsx";
import { NotificationsProvider } from "./context/useNotification.tsx";
import "./i18n/i18n";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <CartProvider>
        <ThemeProvider>
          <SettingsProvider>
            <LanguageProvider>
              <NotificationsProvider>
                <App />
              </NotificationsProvider>
            </LanguageProvider>
          </SettingsProvider>
        </ThemeProvider>
      </CartProvider>
    </AuthProvider>
  </StrictMode>
);
