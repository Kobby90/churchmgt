-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  category text NOT NULL,
  description text,
  updated_by uuid REFERENCES members(id),
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

-- Default settings
INSERT INTO settings (key, value, category, description) VALUES
  ('app_name', '"Church Management System"', 'general', 'Name of the application'),
  ('theme_colors', '{"primary": "#0066cc", "secondary": "#4b5563", "accent": "#10b981"}', 'theme', 'Main color scheme'),
  ('logo_url', '"/logo.png"', 'general', 'Application logo URL'),
  ('date_format', '"MM/dd/yyyy"', 'general', 'Default date format'),
  ('currency_format', '"USD"', 'general', 'Default currency format'),
  ('enable_notifications', 'true', 'features', 'Enable system notifications'),
  ('enable_welfare', 'true', 'features', 'Enable welfare management module'),
  ('enable_family_units', 'true', 'features', 'Enable family units management');

-- Add trigger for settings
CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 