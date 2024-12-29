-- Drop existing types if they exist
DROP TYPE IF EXISTS membership_status_enum CASCADE;
DROP TYPE IF EXISTS role_enum CASCADE;
DROP TYPE IF EXISTS transaction_type_enum CASCADE;
DROP TYPE IF EXISTS payment_method_enum CASCADE;
DROP TYPE IF EXISTS transaction_status_enum CASCADE;
DROP TYPE IF EXISTS welfare_status_enum CASCADE;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS welfare_cases CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS members CASCADE;
DROP TABLE IF EXISTS family_units CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
CREATE TYPE membership_status_enum AS ENUM ('active', 'inactive', 'pending');
CREATE TYPE role_enum AS ENUM ('member', 'admin', 'financial_admin', 'welfare_admin');
CREATE TYPE transaction_type_enum AS ENUM ('tithe', 'offering', 'donation', 'welfare');
CREATE TYPE payment_method_enum AS ENUM ('card', 'bank_transfer', 'cash');
CREATE TYPE transaction_status_enum AS ENUM ('completed', 'pending', 'failed');
CREATE TYPE welfare_status_enum AS ENUM ('pending', 'approved', 'in_progress', 'completed', 'rejected');

-- Members table
CREATE TABLE IF NOT EXISTS members (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id uuid NOT NULL,
  email text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text,
  date_of_birth date,
  address text,
  membership_status membership_status_enum DEFAULT 'pending',
  family_unit_id uuid,
  role role_enum DEFAULT 'member',
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

-- Family units table
CREATE TABLE IF NOT EXISTS family_units (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  head_of_family_id uuid REFERENCES members(id),
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraint to members table
ALTER TABLE members
ADD CONSTRAINT fk_family_unit
FOREIGN KEY (family_unit_id)
REFERENCES family_units(id);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id uuid REFERENCES members(id),
  amount decimal(10,2) NOT NULL,
  type transaction_type_enum NOT NULL,
  payment_method payment_method_enum NOT NULL,
  status transaction_status_enum DEFAULT 'pending',
  date timestamptz DEFAULT CURRENT_TIMESTAMP,
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

-- Welfare cases table
CREATE TABLE IF NOT EXISTS welfare_cases (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id uuid REFERENCES members(id),
  title text NOT NULL,
  description text,
  status welfare_status_enum DEFAULT 'pending',
  amount_requested decimal(10,2) NOT NULL,
  amount_approved decimal(10,2),
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

-- Update members table to reference users
ALTER TABLE members 
  DROP CONSTRAINT IF EXISTS members_auth_id_fkey,
  ADD CONSTRAINT members_auth_id_fkey 
  FOREIGN KEY (auth_id) REFERENCES users(id);

-- Create indexes for better query performance
CREATE INDEX idx_members_auth_id ON members(auth_id);
CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_members_role ON members(role);
CREATE INDEX idx_transactions_member_id ON transactions(member_id);
CREATE INDEX idx_welfare_cases_member_id ON welfare_cases(member_id);

-- Create trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$function$;

-- Create triggers for updated_at columns
CREATE TRIGGER update_members_updated_at
    BEFORE UPDATE ON members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_family_units_updated_at
    BEFORE UPDATE ON family_units
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_welfare_cases_updated_at
    BEFORE UPDATE ON welfare_cases
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 