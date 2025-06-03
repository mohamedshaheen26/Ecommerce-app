import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabase';

interface Settings {
  siteName: string;
  supportEmail: string;
  monthlyOrderGoal: number;
}

interface SettingsContextType {
  settings: Settings;
  isLoading: boolean;
  error: string | null;
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>({
    siteName: '',
    supportEmail: '',
    monthlyOrderGoal: 1000
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .single();

      if (error) throw error;

      if (data) {
        setSettings({
          siteName: data.site_name,
          supportEmail: data.support_email,
          monthlyOrderGoal: data.monthly_order_goal
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching settings');
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<Settings>) => {
    try {
      setIsLoading(true);
      setError(null);

      // First, get the current settings record
      const { data: currentSettings } = await supabase
        .from('settings')
        .select('id')
        .single();

      if (!currentSettings?.id) {
        throw new Error('No settings record found');
      }

      // Update the settings using the specific record ID
      const { error } = await supabase
        .from('settings')
        .update({
          site_name: newSettings.siteName,
          support_email: newSettings.supportEmail,
          monthly_order_goal: newSettings.monthlyOrderGoal
        })
        .eq('id', currentSettings.id);

      if (error) throw error;

      setSettings(prev => ({
        ...prev,
        ...newSettings
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while updating settings');
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
        updateSettings
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
} 