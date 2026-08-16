import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import { query } from './index.js'
import { computeTotals } from '../utils/invoice.js'

dotenv.config()

const DEMO_COMPANY = {
  companyName: 'TechNova Solutions Pvt. Ltd.',
  companyAddress: 'Plot No. 42, Sector 21, Andheri East, Mumbai, Maharashtra - 400069',
  companyGSTIN: '27AAKCS1483C1Z8',
  companyPAN: 'AAKCS1483C',
  companyPhone: '+91 98200 12345',
  companyEmail: 'accounts@technova.in',
  bankName: 'HDFC Bank',
  accountNo: '50100234567890',
  accountName: 'TechNova Solutions Pvt. Ltd.',
  accountType: 'Current',
  ifsc: 'HDFC0001234',
  notes: 'Thank you for your business! For any queries regarding this invoice, please contact accounts@technova.in.',
  terms: 'Payment is due within 30 days. Late payment subject to fees as per our terms and conditions.',
  cgstRate: '9',
  sgstRate: '9',
}

const DEMO_INVOICES = [
  {
    invoiceNumber: 'INV-2026-011',
    invoiceDate: '2026-07-10',
    dueDate: '2026-08-09',
    clientName: 'Nova Retail Chain Pvt. Ltd.',
    clientPhone: '+91 90040 11223',
    clientAddress: '12, MG Road, Bengaluru, Karnataka - 560001',
    clientGSTIN: '29AAACN4543F1Z1',
    items: [
      { description: 'POS Billing Software License (Annual)', hsnCode: '997338', quantity: 1, rate: 48000, amount: 48000 },
      { description: 'Installation & Training', hsnCode: '998313', quantity: 1, rate: 12000, amount: 12000 },
    ],
    cgstRate: '9',
    sgstRate: '9',
    pfCharge: '0',
    deliveryCharge: '',
    notes: 'Thank you for your business!',
    terms: 'Payment is due within 30 days. Late payment subject to fees as per our terms and conditions.',
  },
  {
    invoiceNumber: 'INV-2026-012',
    invoiceDate: '2026-07-22',
    dueDate: '2026-08-21',
    clientName: 'Sunrise Agro Exports',
    clientPhone: '+91 98220 55667',
    clientAddress: '88, Ring Road, Surat, Gujarat - 395002',
    clientGSTIN: '24AABCS8899M1Z4',
    items: [
      { description: 'ERP Implementation Services', hsnCode: '998314', quantity: 1, rate: 65000, amount: 65000 },
      { description: 'Data Migration', hsnCode: '998311', quantity: 1, rate: 15000, amount: 15000 },
      { description: 'Annual Support & Maintenance', hsnCode: '998313', quantity: 1, rate: 18000, amount: 18000 },
    ],
    cgstRate: '9',
    sgstRate: '9',
    pfCharge: '200',
    deliveryCharge: 'Free',
    notes: 'Thank you for your business!',
    terms: 'Payment is due within 30 days. Late payment subject to fees as per our terms and conditions.',
  },
  {
    invoiceNumber: 'INV-2026-013',
    invoiceDate: '2026-08-02',
    dueDate: '2026-09-01',
    clientName: 'Orbit Pharma Distributors',
    clientPhone: '+91 99300 88776',
    clientAddress: 'Tower A, Cyber Park, Noida, Uttar Pradesh - 201301',
    clientGSTIN: '09AAACO1234F1Z7',
    items: [
      { description: 'Custom Inventory Management Software', hsnCode: '997337', quantity: 1, rate: 85000, amount: 85000 },
    ],
    cgstRate: '9',
    sgstRate: '9',
    pfCharge: '0',
    deliveryCharge: '',
    notes: 'Thank you for your business!',
    terms: 'Payment is due within 30 days. Late payment subject to fees as per our terms and conditions.',
  },
]

const seed = async () => {
  const username = process.env.ADMIN_USERNAME || 'admin'
  const password = process.env.ADMIN_PASSWORD || 'admin123'

  const existing = await query('SELECT id FROM admins WHERE username = $1', [username])
  if (existing.rows.length === 0) {
    const hash = await bcrypt.hash(password, 10)
    await query('INSERT INTO admins (username, password_hash) VALUES ($1, $2)', [username, hash])
    console.log(`✓ Admin user created  (username: ${username}, password: ${password})`)
  } else {
    console.log('ℹ Admin user already exists, skipping')
  }

  const settings = await query('SELECT id FROM company_settings WHERE id = 1')
  if (settings.rows.length === 0) {
    await query(
      `INSERT INTO company_settings (
        company_name, company_address, company_gstin, company_pan, company_phone, company_email,
        bank_name, account_no, account_name, account_type, ifsc, notes, terms, cgst_rate, sgst_rate
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
      [
        DEMO_COMPANY.companyName, DEMO_COMPANY.companyAddress, DEMO_COMPANY.companyGSTIN,
        DEMO_COMPANY.companyPAN, DEMO_COMPANY.companyPhone, DEMO_COMPANY.companyEmail,
        DEMO_COMPANY.bankName, DEMO_COMPANY.accountNo, DEMO_COMPANY.accountName,
        DEMO_COMPANY.accountType, DEMO_COMPANY.ifsc, DEMO_COMPANY.notes, DEMO_COMPANY.terms,
        DEMO_COMPANY.cgstRate, DEMO_COMPANY.sgstRate,
      ]
    )
    console.log('✓ Company settings seeded')
  } else {
    console.log('ℹ Company settings already exist, skipping')
  }

  const { rows } = await query('SELECT COUNT(*)::int AS count FROM invoices')
  if (rows[0].count === 0) {
    for (const inv of DEMO_INVOICES) {
      const t = computeTotals(inv)
      await query(
        `INSERT INTO invoices (
          invoice_number, invoice_date, due_date,
          company_name, company_address, company_gstin, company_pan, company_phone, company_email,
          bank_name, account_no, account_name, account_type, ifsc,
          client_name, client_phone, client_address, client_gstin,
          items, cgst_rate, sgst_rate, pf_charge, delivery_charge, notes, terms,
          subtotal, taxable_value, cgst_amount, sgst_amount, total
        ) VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30
        )`,
        [
          inv.invoiceNumber, inv.invoiceDate, inv.dueDate,
          DEMO_COMPANY.companyName, DEMO_COMPANY.companyAddress, DEMO_COMPANY.companyGSTIN,
          DEMO_COMPANY.companyPAN, DEMO_COMPANY.companyPhone, DEMO_COMPANY.companyEmail,
          DEMO_COMPANY.bankName, DEMO_COMPANY.accountNo, DEMO_COMPANY.accountName,
          DEMO_COMPANY.accountType, DEMO_COMPANY.ifsc,
          inv.clientName, inv.clientPhone, inv.clientAddress, inv.clientGSTIN,
          JSON.stringify(inv.items), inv.cgstRate, inv.sgstRate, inv.pfCharge, inv.deliveryCharge,
          inv.notes, inv.terms,
          t.subtotal, t.taxableValue, t.cgst, t.sgst, t.total,
        ]
      )
    }
    console.log(`✓ ${DEMO_INVOICES.length} demo invoices seeded`)
  } else {
    console.log(`ℹ Invoices already exist (${rows[0].count}), skipping`)
  }

  console.log('✓ Seed complete')
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed failed:', err.message)
    process.exit(1)
  })
