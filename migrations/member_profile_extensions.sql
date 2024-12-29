-- Add new columns to members table
ALTER TABLE members ADD COLUMN IF NOT EXISTS anniversary_date date;
ALTER TABLE members ADD COLUMN IF NOT EXISTS profile_privacy jsonb DEFAULT '{
  "show_email": false,
  "show_phone": false,
  "show_address": false,
  "show_birthday": false,
  "show_anniversary": false
}'::jsonb;

-- Create events table for birthdays and anniversaries
CREATE TABLE IF NOT EXISTS member_events (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id uuid REFERENCES members(id),
  event_type text NOT NULL CHECK (event_type IN ('birthday', 'anniversary', 'other')),
  event_date date NOT NULL,
  title text NOT NULL,
  description text,
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

-- Create audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES members(id),
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  changes jsonb,
  ip_address text,
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP
); 