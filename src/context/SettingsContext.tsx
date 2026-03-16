import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { apiUpdateSettings, fetchSettings } from "../api/settings";
import type { ISettings } from "../types/setting";

interface SettingsContextType {
  settings: ISettings;
  isLoading: boolean;
  error: string | null;
  updateSettings: (newSettings: Partial<ISettings>) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ISettings>({
    site_name: "",
    site_name_ar: "",
    about_us: "",
    about_us_ar: "",
    address: "",
    address_ar: "",
    phone_number: "",
    support_email: "",
    monthly_order_goal: 1000,
    first_order_discount: 25,
    free_shipping_minimum: 100,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await fetchSettings();

      if (data) {
        setSettings({
          site_name: data.site_name,
          site_name_ar: data.site_name_ar,
          about_us: data.about_us,
          about_us_ar: data.about_us_ar,
          address: data.address,
          address_ar: data.address_ar,
          phone_number: data.phone_number,
          support_email: data.support_email,
          monthly_order_goal: data.monthly_order_goal,
          first_order_discount: data.first_order_discount,
          free_shipping_minimum: data.free_shipping_minimum,
        });
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while fetching settings",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<ISettings>) => {
    try {
      setIsLoading(true);
      setError(null);

      await apiUpdateSettings(newSettings);

      setSettings((prev) => ({
        ...prev,
        ...newSettings,
      }));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while updating settings",
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        isLoading,
        error,
        updateSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
