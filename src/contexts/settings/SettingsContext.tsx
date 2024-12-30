import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './auth';
import { useLocation } from 'react-router-dom';

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
  enableDocumentSharing: boolean;
  enableVersionControl: boolean;
  defaultDocumentAccess: string;
  logoUrl?: string;
}

interface SettingsContextType {
  settings: Settings | null;
  loading: boolean;
  error: string | null;
  updateSettings: (newSettings: Settings) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const DEFAULT_SETTINGS: Settings = {
  appName: 'Church Management System',
  themeColors: {
    primary: '#0066cc',
    secondary: '#4b5563',
    accent: '#10b981'
  },
  dateFormat: 'MM/dd/yyyy',
  currencyFormat: 'USD',
  enableNotifications: true,
  enableWelfare: true,
  enableFamilyUnits: true,
  enableDocumentSharing: true,
  enableVersionControl: true,
  defaultDocumentAccess: 'members'
};

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings | null>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();
  const location = useLocation();

  // List of paths that don't require settings
  const publicPaths = ['/login', '/register', '/forgot-password'];
  const isPublicPath = publicPaths.includes(location.pathname);

  useEffect(() => {
    async function fetchSettings() {
      if (!token) {
        if (isPublicPath) {
          setLoading(false);
          return;
        }
        setError('Authentication required');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/settings', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch settings');
        }

        const data = await response.json();
        setSettings({ ...DEFAULT_SETTINGS, ...data });
        setError(null);
      } catch (error) {
        console.error('Error fetching settings:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch settings');
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, [token, isPublicPath]);

  const updateSettings = async (newSettings: Settings) => {
    if (!token) {
      throw new Error('Authentication required');
    }

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
        throw new Error('Failed to update settings');
      }

      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  };

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