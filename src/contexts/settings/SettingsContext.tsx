import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../auth';

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
}

interface Settings {
  appName: string;
  themeColors: ThemeColors;
  logoUrl: string;
  dateFormat: string;
  currencyFormat: string;
  enableNotifications: boolean;
  enableWelfare: boolean;
  enableFamilyUnits: boolean;
}

interface SettingsContextType {
  settings: Settings;
  loading: boolean;
  error: string | null;
  updateSettings: (key: string, value: any) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const [settings, setSettings] = useState<Settings>({
    appName: 'Church Management System',
    themeColors: {
      primary: '#0066cc',
      secondary: '#4b5563',
      accent: '#10b981'
    },
    logoUrl: '/logo.png',
    dateFormat: 'MM/dd/yyyy',
    currencyFormat: 'USD',
    enableNotifications: true,
    enableWelfare: true,
    enableFamilyUnits: true
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch settings');
      const data = await response.json();
      setSettings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (key: string, value: any) => {
    try {
      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ key, value })
      });
      
      if (!response.ok) throw new Error('Failed to update settings');
      
      const updatedSettings = await response.json();
      setSettings(updatedSettings);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update settings');
    }
  };

  useEffect(() => {
    if (token) {
      fetchSettings();
    }
  }, [token]);

  return (
    <SettingsContext.Provider value={{ settings, loading, error, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}; 