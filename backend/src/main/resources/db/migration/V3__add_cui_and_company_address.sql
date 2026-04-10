-- Add CUI (Cod Unic de Identificare) column for professionals
ALTER TABLE users ADD COLUMN IF NOT EXISTS cui VARCHAR(20) UNIQUE;

-- Add company address column for professionals
ALTER TABLE users ADD COLUMN IF NOT EXISTS company_address TEXT;

-- Create index on CUI for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_cui ON users(cui);
