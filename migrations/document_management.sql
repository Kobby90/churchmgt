-- Document management tables
CREATE TABLE IF NOT EXISTS document_categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id uuid REFERENCES document_categories(id),
  title text NOT NULL,
  description text,
  file_url text NOT NULL,
  file_type text NOT NULL,
  file_size integer NOT NULL,
  uploaded_by uuid REFERENCES members(id),
  access_level text NOT NULL DEFAULT 'private',
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

-- Document access permissions
CREATE TABLE IF NOT EXISTS document_permissions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id uuid REFERENCES documents(id),
  member_id uuid REFERENCES members(id),
  permission_type text NOT NULL CHECK (permission_type IN ('view', 'edit', 'delete')),
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP
); 