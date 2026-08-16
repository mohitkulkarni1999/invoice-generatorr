-- ============================================================
-- Invoice Generator - Supabase setup + seed
-- Run this once in: Supabase Dashboard -> SQL Editor -> New query
-- Admin login after deploy: admin / admin123
-- ============================================================

CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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
);

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
);

CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices (invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_date ON invoices (invoice_date);
CREATE INDEX IF NOT EXISTS idx_invoices_client_name ON invoices (client_name);

-- Admin user (password: admin123)
INSERT INTO admins (username, password_hash)
VALUES ('admin', '$2b$10$v5T0gEXpWnD88wMiQwn2o.PuO1vh4/UzsnOTNwjEed1rDUYnb451q')
ON CONFLICT (username) DO NOTHING;

-- Company settings
INSERT INTO company_settings (
  id, company_name, company_address, company_gstin, company_pan, company_phone, company_email,
  bank_name, account_no, account_name, account_type, ifsc, notes, terms, cgst_rate, sgst_rate
) VALUES (
  1,
  'TechNova Solutions Pvt. Ltd.',
  'Plot No. 42, Sector 21, Andheri East, Mumbai, Maharashtra - 400069',
  '27AAKCS1483C1Z8',
  'AAKCS1483C',
  '+91 98200 12345',
  'accounts@technova.in',
  'HDFC Bank',
  '50100234567890',
  'TechNova Solutions Pvt. Ltd.',
  'Current',
  'HDFC0001234',
  'Thank you for your business! For any queries regarding this invoice, please contact accounts@technova.in.',
  'Payment is due within 30 days. Late payment subject to fees as per our terms and conditions.',
  9,
  9
)
ON CONFLICT (id) DO NOTHING;

-- Demo invoices
INSERT INTO invoices (
  invoice_number, invoice_date, due_date,
  company_name, company_address, company_gstin, company_pan, company_phone, company_email,
  bank_name, account_no, account_name, account_type, ifsc,
  client_name, client_phone, client_address, client_gstin,
  items, cgst_rate, sgst_rate, pf_charge, delivery_charge, include_pf, include_delivery, notes, terms,
  subtotal, taxable_value, cgst_amount, sgst_amount, total
) VALUES
(
  'INV-2026-011', '2026-07-10', '2026-08-09',
  'TechNova Solutions Pvt. Ltd.', 'Plot No. 42, Sector 21, Andheri East, Mumbai, Maharashtra - 400069',
  '27AAKCS1483C1Z8', 'AAKCS1483C', '+91 98200 12345', 'accounts@technova.in',
  'HDFC Bank', '50100234567890', 'TechNova Solutions Pvt. Ltd.', 'Current', 'HDFC0001234',
  'Nova Retail Chain Pvt. Ltd.', '+91 90040 11223', '12, MG Road, Bengaluru, Karnataka - 560001', '29AAACN4543F1Z1',
  '[{"description":"POS Billing Software License (Annual)","hsnCode":"997338","quantity":1,"rate":48000,"amount":48000},{"description":"Installation & Training","hsnCode":"998313","quantity":1,"rate":12000,"amount":12000}]',
  9, 9, 0, '', TRUE, TRUE,
  'Thank you for your business!', 'Payment is due within 30 days. Late payment subject to fees as per our terms and conditions.',
  60000.00, 60000.00, 5400.00, 5400.00, 70800.00
),
(
  'INV-2026-012', '2026-07-22', '2026-08-21',
  'TechNova Solutions Pvt. Ltd.', 'Plot No. 42, Sector 21, Andheri East, Mumbai, Maharashtra - 400069',
  '27AAKCS1483C1Z8', 'AAKCS1483C', '+91 98200 12345', 'accounts@technova.in',
  'HDFC Bank', '50100234567890', 'TechNova Solutions Pvt. Ltd.', 'Current', 'HDFC0001234',
  'Sunrise Agro Exports', '+91 98220 55667', '88, Ring Road, Surat, Gujarat - 395002', '24AABCS8899M1Z4',
  '[{"description":"ERP Implementation Services","hsnCode":"998314","quantity":1,"rate":65000,"amount":65000},{"description":"Data Migration","hsnCode":"998311","quantity":1,"rate":15000,"amount":15000},{"description":"Annual Support & Maintenance","hsnCode":"998313","quantity":1,"rate":18000,"amount":18000}]',
  9, 9, 200, 'Free', TRUE, TRUE,
  'Thank you for your business!', 'Payment is due within 30 days. Late payment subject to fees as per our terms and conditions.',
  98000.00, 98200.00, 8838.00, 8838.00, 115876.00
),
(
  'INV-2026-013', '2026-08-02', '2026-09-01',
  'TechNova Solutions Pvt. Ltd.', 'Plot No. 42, Sector 21, Andheri East, Mumbai, Maharashtra - 400069',
  '27AAKCS1483C1Z8', 'AAKCS1483C', '+91 98200 12345', 'accounts@technova.in',
  'HDFC Bank', '50100234567890', 'TechNova Solutions Pvt. Ltd.', 'Current', 'HDFC0001234',
  'Orbit Pharma Distributors', '+91 99300 88776', 'Tower A, Cyber Park, Noida, Uttar Pradesh - 201301', '09AAACO1234F1Z7',
  '[{"description":"Custom Inventory Management Software","hsnCode":"997337","quantity":1,"rate":85000,"amount":85000}]',
  9, 9, 0, '', TRUE, TRUE,
  'Thank you for your business!', 'Payment is due within 30 days. Late payment subject to fees as per our terms and conditions.',
  85000.00, 85000.00, 7650.00, 7650.00, 100300.00
)
ON CONFLICT (invoice_number) DO NOTHING;
