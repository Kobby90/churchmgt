/*
  # Initial Schema Setup for Church Management System

  1. Tables
    - members
      - Basic member information
      - Authentication and profile data
    - family_units
      - Family grouping information
    - transactions
      - Financial transactions including tithes and donations
    - welfare_cases
      - Welfare request and management
    
  2. Security
    - RLS policies for each table
    - Role-based access control
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Members table
CREATE TABLE IF NOT EXISTS members (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id uuid REFERENCES auth.users(id),
  email text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text,
  date_of_birth date,
  address text,
  membership_status text DEFAULT 'pending',
  family_unit_id uuid,
  role text DEFAULT 'member',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Family units table
CREATE TABLE IF NOT EXISTS family_units (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  head_of_family_id uuid REFERENCES members(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
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
  type text NOT NULL,
  payment_method text NOT NULL,
  status text DEFAULT 'pending',
  date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Welfare cases table
CREATE TABLE IF NOT EXISTS welfare_cases (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id uuid REFERENCES members(id),
  title text NOT NULL,
  description text,
  status text DEFAULT 'pending',
  amount_requested decimal(10,2) NOT NULL,
  amount_approved decimal(10,2),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE welfare_cases ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Members policies
CREATE POLICY "Members can view their own profile"
  ON members FOR SELECT
  TO authenticated
  USING (auth_id = auth.uid());

CREATE POLICY "Admin can view all members"
  ON members FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM members WHERE auth_id = auth.uid() AND role = 'admin'
  ));

-- Family units policies
CREATE POLICY "Members can view their family unit"
  ON family_units FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT family_unit_id 
      FROM members 
      WHERE auth_id = auth.uid()
    )
  );

-- Transactions policies
CREATE POLICY "Members can view their own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (member_id IN (
    SELECT id 
    FROM members 
    WHERE auth_id = auth.uid()
  ));

CREATE POLICY "Financial admin can view all transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM members 
    WHERE auth_id = auth.uid() 
    AND role IN ('admin', 'financial_admin')
  ));

-- Welfare cases policies
CREATE POLICY "Members can view their own welfare cases"
  ON welfare_cases FOR SELECT
  TO authenticated
  USING (member_id IN (
    SELECT id 
    FROM members 
    WHERE auth_id = auth.uid()
  ));

CREATE POLICY "Welfare admin can view all cases"
  ON welfare_cases FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM members 
    WHERE auth_id = auth.uid() 
    AND role IN ('admin', 'welfare_admin')
  ));