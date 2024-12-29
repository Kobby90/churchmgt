import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';

interface Settings {
  appName: string;
  themeColors: {
    primary: string;
    secondary: string;
    accent: string;
  };
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
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const [settings, setSettings] = useState<Settings>({
    appName: 'Church Management System',
    themeColors: {
      primary: '#4F46E5',
      secondary: '#10B981',
      accent: '#F59E0B'
    },
    dateFormat: 'MM/dd/yyyy',
    currencyFormat: 'USD',
    enableNotifications: true,
    enableWelfare: true,
    enableFamilyUnits: true
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    if (!token) return;
    
    try {
      const response = await fetch('/api/settings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch settings');
      const data = await response.json();
      setSettings(data);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch settings');
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<Settings>) => {
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newSettings)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update settings');
      }
      
      const updatedSettings = await response.json();
      setSettings(prevSettings => ({
        ...prevSettings,
        ...updatedSettings
      }));
      return updatedSettings;
    } catch (err) {
      console.error('Settings update error:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to update settings');
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [token]);

  return (
    <SettingsContext.Provider value={{ settings, loading, error, updateSettings }}>
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