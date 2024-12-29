import express from 'express';
import { db } from '@/lib/db';
import { authMiddleware } from '@/middleware/auth';
import { checkRole } from '@/middleware/roles';

const router = express.Router();

// Add this helper function at the top
function transformSettingsForDB(settings: any) {
  const transformed: Record<string, any> = {};
  
  // Transform camelCase to snake_case
  if (settings.appName) transformed.app_name = settings.appName;
  if (settings.themeColors) transformed.theme_colors = settings.themeColors;
  if (settings.logoUrl) transformed.logo_url = settings.logoUrl;
  if (settings.dateFormat) transformed.date_format = settings.dateFormat;
  if (settings.currencyFormat) transformed.currency_format = settings.currencyFormat;
  if (settings.enableNotifications) transformed.enable_notifications = settings.enableNotifications;
  if (settings.enableWelfare) transformed.enable_welfare = settings.enableWelfare;
  if (settings.enableFamilyUnits) transformed.enable_family_units = settings.enableFamilyUnits;
  
  return transformed;
}

function transformSettingsForFrontend(settings: any) {
  return {
    appName: settings.app_name,
    themeColors: settings.theme_colors,
    logoUrl: settings.logo_url,
    dateFormat: settings.date_format,
    currencyFormat: settings.currency_format,
    enableNotifications: settings.enable_notifications,
    enableWelfare: settings.enable_welfare,
    enableFamilyUnits: settings.enable_family_units
  };
}

// Get all settings
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM settings');
    const settings = rows.reduce((acc, row) => ({
      ...acc,
      [row.key]: JSON.parse(row.value)
    }), {});
    
    // Transform to camelCase for frontend
    const transformedSettings = {
      appName: settings.app_name,
      themeColors: settings.theme_colors,
      logoUrl: settings.logo_url,
      dateFormat: settings.date_format,
      currencyFormat: settings.currency_format,
      enableNotifications: settings.enable_notifications,
      enableWelfare: settings.enable_welfare,
      enableFamilyUnits: settings.enable_family_units
    };
    
    res.json(transformedSettings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update settings (admin only)
router.put('/', authMiddleware, checkRole(['admin']), async (req, res) => {
  const settings = req.body;
  const dbSettings = transformSettingsForDB(settings);
  
  try {
    await db.query('BEGIN');
    
    for (const [key, value] of Object.entries(dbSettings)) {
      await db.query(
        `INSERT INTO settings (key, value, category)
         VALUES ($1, $2, 'general')
         ON CONFLICT (key) 
         DO UPDATE SET 
           value = $2,
           updated_by = $3,
           updated_at = CURRENT_TIMESTAMP`,
        [key, JSON.stringify(value), req.user?.id]
      );
    }
    
    await db.query('COMMIT');
    
    // Fetch and return updated settings
    const { rows } = await db.query('SELECT * FROM settings');
    const updatedSettings = transformSettingsForFrontend(
      rows.reduce((acc, row) => ({
        ...acc,
        [row.key]: JSON.parse(row.value)
      }), {})
    );
    
    res.json(updatedSettings);
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error updating settings:', error);
    res.status(500).json({ 
      error: 'Failed to update settings',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router; 