import { query } from './index.js'

const setup = async () => {
  await query(`
    CREATE TABLE IF NOT EXISTS admins (
      id SERIAL PRIMARY KEY,
      username VARCHAR(100) NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  await query(`
    CREATE TABLE IF NOT EXISTS company_settings (
      id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
      company_name VARCHAR(255),
      company_address TEXT,
      company_gstin VARCHAR(20),
      company_pan VARCHAR(20),
      company_phone VARCHAR(30),
      company_email VARCHAR(120),
      bank_name VARCHAR(120),
      account_no VARCHAR(40),
      account_name VARCHAR(120),
      account_type VARCHAR(40),
      ifsc VARCHAR(20),
      notes TEXT,
      terms TEXT,
      cgst_rate NUMERIC(5,2) NOT NULL DEFAULT 9,
      sgst_rate NUMERIC(5,2) NOT NULL DEFAULT 9,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  await query(`
    CREATE TABLE IF NOT EXISTS invoices (
      id SERIAL PRIMARY KEY,
      invoice_number VARCHAR(50) NOT NULL UNIQUE,
      invoice_date DATE NOT NULL,
      due_date DATE,
      company_name VARCHAR(255),
      company_address TEXT,
      company_gstin VARCHAR(20),
      company_pan VARCHAR(20),
      company_phone VARCHAR(30),
      company_email VARCHAR(120),
      bank_name VARCHAR(120),
      account_no VARCHAR(40),
      account_name VARCHAR(120),
      account_type VARCHAR(40),
      ifsc VARCHAR(20),
      client_name VARCHAR(255) NOT NULL,
      client_phone VARCHAR(30),
      client_address TEXT,
      client_gstin VARCHAR(20),
      items JSONB NOT NULL DEFAULT '[]'::jsonb,
      cgst_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
      sgst_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
      pf_charge NUMERIC(12,2) NOT NULL DEFAULT 0,
      delivery_charge VARCHAR(100) DEFAULT '',
      include_pf BOOLEAN NOT NULL DEFAULT TRUE,
      include_delivery BOOLEAN NOT NULL DEFAULT TRUE,
      notes TEXT,
      terms TEXT,
      subtotal NUMERIC(14,2) NOT NULL DEFAULT 0,
      taxable_value NUMERIC(14,2) NOT NULL DEFAULT 0,
      cgst_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
      sgst_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
      total NUMERIC(14,2) NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  await query(`
    CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices (invoice_number)
  `)
  await query(`
    CREATE INDEX IF NOT EXISTS idx_invoices_invoice_date ON invoices (invoice_date)
  `)
  await query(`
    CREATE INDEX IF NOT EXISTS idx_invoices_client_name ON invoices (client_name)
  `)

  await query(`
    ALTER TABLE invoices ADD COLUMN IF NOT EXISTS include_pf BOOLEAN NOT NULL DEFAULT TRUE
  `)
  await query(`
    ALTER TABLE invoices ADD COLUMN IF NOT EXISTS include_delivery BOOLEAN NOT NULL DEFAULT TRUE
  `)

  console.log('✓ Database schema ready')
}

setup()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Schema setup failed:', err.message)
    process.exit(1)
  })
