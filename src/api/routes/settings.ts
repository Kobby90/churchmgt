import express from 'express';
import { db } from '@/lib/db';
import { authMiddleware } from '@/middleware/auth';
import { checkRole } from '@/middleware/roles';

const router = express.Router();

// Add this helper function at the top
function transformSettingsForDB(settings: any) {
  const transformed: Record<string, any> = {};
  
  // Transform all settings fields
  transformed.app_name = settings.appName;
  transformed.theme_colors = settings.themeColors;
  transformed.date_format = settings.dateFormat;
  transformed.currency_format = settings.currencyFormat;
  transformed.enable_notifications = settings.enableNotifications;
  transformed.enable_welfare = settings.enableWelfare;
  transformed.enable_family_units = settings.enableFamilyUnits;
  transformed.enable_document_sharing = settings.enableDocumentSharing;
  transformed.enable_version_control = settings.enableVersionControl;
  transformed.default_document_access = settings.defaultDocumentAccess;
  transformed.logo_url = settings.logoUrl;
  
  return transformed;
}
function transformSettingsForFrontend(settings: any) {
  return {
    appName: settings.app_name,
    themeColors: settings.theme_colors,
    dateFormat: settings.date_format,
    currencyFormat: settings.currency_format,
    enableNotifications: settings.enable_notifications,
    enableWelfare: settings.enable_welfare,
    enableFamilyUnits: settings.enable_family_units,
    enableDocumentSharing: settings.enable_document_sharing,
    enableVersionControl: settings.enable_version_control,
    defaultDocumentAccess: settings.default_document_access,
    logoUrl: settings.logo_url
  };
}

// Helper function to format value for database storage
function formatValueForDB(key: string, value: any): string {
  // Keys that should be stored as plain strings
  const stringKeys = ['app_name', 'logo_url', 'date_format', 'currency_format', 'default_document_access'];
  
  if (stringKeys.includes(key)) {
    return JSON.stringify(value);
  }
  
  // Boolean values
  if (typeof value === 'boolean') {
    return JSON.stringify(value);
  }
  
  // Objects/arrays
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  
  return JSON.stringify(value);
}

// Helper function to parse value for frontend response
function parseValueForResponse(key: string, value: any): any {
  try {
    // If value is already an object (not a string), return it as is
    if (typeof value === 'object' && value !== null) {
      return value;
    }

    // Try to parse the value as JSON
    const parsedValue = JSON.parse(value);
    
    // Keys that should be returned as plain strings
    const stringKeys = ['app_name', 'logo_url', 'date_format', 'currency_format', 'default_document_access'];
    if (stringKeys.includes(key) && typeof parsedValue === 'string') {
      return parsedValue;
    }
    
    return parsedValue;
  } catch (error) {
    console.error(`Error parsing value for key ${key}:`, error);
    // Return the original value if parsing fails
    return value;
  }
}

// Get all settings
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Log the request
    console.log('API Route - Auth token:', req.headers.authorization?.substring(0, 20) + '...');
    
    // Verify auth
    if (!req.user) {
      console.log('API Route - No authenticated user');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log('API Route - Fetching settings for user:', req.user.id);
    const { rows } = await db.query(`
      SELECT key, value, category, description 
      FROM settings
      ORDER BY category, key
    `);
    
    if (!rows.length) {
      console.log('API Route - No settings found in database');
      return res.status(404).json({ error: 'No settings found' });
    }

    console.log('API Route - Found settings:', rows.length);
    
    // Group settings by category
    const settingsByCategory = rows.reduce((acc, row) => {
      const { category, key, value } = row;
      if (!acc[category]) {
        acc[category] = {};
      }
      
      // Don't try to parse simple string values and handle objects
      const simpleKeys = ['app_name', 'currency_format', 'date_format', 'logo_url', 'default_document_access'];
      if (simpleKeys.includes(key)) {
        acc[category][key] = value;
      } else {
        try {
          // Check if value is already an object
          if (typeof value === 'object') {
            acc[category][key] = value;
          } else {
            acc[category][key] = JSON.parse(value);
          }
        } catch (e) {
          console.error(`API - Error parsing value for key ${key}:`, e);
          acc[category][key] = value;
        }
      }
      return acc;
    }, {});

    console.log('API - Grouped settings:', settingsByCategory);

    const transformedSettings = {
      appName: settingsByCategory.general?.app_name || 'Church Management System',
      themeColors: settingsByCategory.theme?.theme_colors || {
        primary: '#0066cc',
        secondary: '#4b5563',
        accent: '#10b981'
      },
      dateFormat: settingsByCategory.general?.date_format || 'MM/dd/yyyy',
      currencyFormat: settingsByCategory.general?.currency_format || 'USD',
      enableNotifications: settingsByCategory.features?.enable_notifications ?? true,
      enableWelfare: settingsByCategory.features?.enable_welfare ?? true,
      enableFamilyUnits: settingsByCategory.features?.enable_family_units ?? true,
      enableDocumentSharing: settingsByCategory.features?.enable_document_sharing ?? true,
      enableVersionControl: settingsByCategory.features?.enable_version_control ?? true,
      defaultDocumentAccess: settingsByCategory.features?.default_document_access || 'members',
      logoUrl: settingsByCategory.general?.logo_url || null
    };

    console.log('API - Sending transformed settings:', transformedSettings);
    return res.json(transformedSettings);
  } catch (error) {
    console.error('API Route - Error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch settings',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update settings (admin only)
router.put('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const settings = req.body;
    console.log('Received settings update request:', settings);

    // Transform the settings keys to snake_case for DB
    const dbSettings = {
      app_name: settings.appName,
      theme_colors: settings.themeColors,
      date_format: settings.dateFormat,
      currency_format: settings.currencyFormat,
      enable_notifications: settings.enableNotifications,
      enable_welfare: settings.enableWelfare,
      enable_family_units: settings.enableFamilyUnits,
      enable_document_sharing: settings.enableDocumentSharing,
      enable_version_control: settings.enableVersionControl,
      default_document_access: settings.defaultDocumentAccess,
      logo_url: settings.logoUrl
    };

    // Update each setting individually with proper formatting
    for (const [key, value] of Object.entries(dbSettings)) {
      console.log(`Updating setting: ${key}`, value);
      const formattedValue = formatValueForDB(key, value);
      
      await db.query(
        `UPDATE settings 
         SET value = $1
         WHERE key = $2`,
        [formattedValue, key]
      );
    }

    // Fetch updated settings
    const { rows } = await db.query('SELECT key, value FROM settings');
    
    // Transform settings back to frontend format
    const updatedSettings = rows.reduce((acc, { key, value }) => {
      const parsedValue = parseValueForResponse(key, value);
      const camelKey = key.replace(/_([a-z])/g, g => g[1].toUpperCase());
      acc[camelKey] = parsedValue;
      return acc;
    }, {});

    res.json(updatedSettings);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

export default router; 