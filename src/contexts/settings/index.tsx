import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
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
  settings: Settings;
  loading: boolean;
  error: string | null;
  updateSettings: (newSettings: Partial<Settings>) => Promise<Settings>;
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
  const { token } = useAuth();
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();

  // List of paths that don't require fetching settings from the server
  const publicPaths = ['/login', '/register', '/forgot-password'];
  const isPublicPath = publicPaths.includes(location.pathname);

  useEffect(() => {
    async function fetchSettings() {
      // Don't fetch settings for public paths
      if (isPublicPath) {
        setLoading(false);
        return;
      }

      // Only fetch settings if we have a token
      if (!token) {
        setLoading(false);
        return;
      }

      setLoading(true);
      
      try {
        const response = await fetch('/api/settings', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch settings');
        }

        const data = await response.json();
        setSettings({ ...DEFAULT_SETTINGS, ...data });
        setError(null);
      } catch (err) {
        console.error('SettingsProvider - Error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch settings');
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, [token, isPublicPath]);

  const updateSettings = async (newSettings: Partial<Settings>): Promise<Settings> => {
    try {
      console.log('Sending settings update:', newSettings);
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newSettings)
      });
      
      console.log('Update response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Failed to update settings');
      }
      
      const updatedSettings = await response.json();
      console.log('Received updated settings:', updatedSettings);
      
      setSettings(prevSettings => ({
        ...prevSettings,
        ...updatedSettings
      }));
      
      return updatedSettings;
    } catch (err) {
      console.error('Settings update error:', err);
      throw err;
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