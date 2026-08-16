import { Router } from 'express'
import { query } from '../db/index.js'

const router = Router()

const COLS = `company_name, company_address, company_gstin, company_pan, company_phone, company_email,
  bank_name, account_no, account_name, account_type, ifsc, notes, terms, cgst_rate, sgst_rate`

const mapDbToApi = (row) => ({
  companyName: row.company_name || '',
  companyAddress: row.company_address || '',
  companyGSTIN: row.company_gstin || '',
  companyPAN: row.company_pan || '',
  companyPhone: row.company_phone || '',
  companyEmail: row.company_email || '',
  bankName: row.bank_name || '',
  accountNo: row.account_no || '',
  accountName: row.account_name || '',
  accountType: row.account_type || '',
  ifsc: row.ifsc || '',
  notes: row.notes || '',
  terms: row.terms || '',
  cgstRate: String(row.cgst_rate),
  sgstRate: String(row.sgst_rate),
  updatedAt: row.updated_at,
})

router.get('/', async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM company_settings WHERE id = 1')
    if (!rows[0]) return res.status(404).json({ error: 'Settings not found' })
    res.json(mapDbToApi(rows[0]))
  } catch (err) {
    console.error('Get settings error:', err)
    res.status(500).json({ error: 'Failed to fetch settings' })
  }
})

router.put('/', async (req, res) => {
  try {
    const d = req.body || {}
    await query(
      `INSERT INTO company_settings (id, ${COLS}) VALUES (1,$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       ON CONFLICT (id) DO UPDATE SET
         company_name=$1, company_address=$2, company_gstin=$3, company_pan=$4, company_phone=$5, company_email=$6,
         bank_name=$7, account_no=$8, account_name=$9, account_type=$10, ifsc=$11, notes=$12, terms=$13,
         cgst_rate=$14, sgst_rate=$15, updated_at=NOW()`,
      [
        d.companyName || '', d.companyAddress || '', d.companyGSTIN || '', d.companyPAN || '',
        d.companyPhone || '', d.companyEmail || '', d.bankName || '', d.accountNo || '',
        d.accountName || '', d.accountType || '', d.ifsc || '', d.notes || '', d.terms || '',
        parseFloat(d.cgstRate) || 0, parseFloat(d.sgstRate) || 0,
      ]
    )
    const { rows } = await query('SELECT * FROM company_settings WHERE id = 1')
    res.json(mapDbToApi(rows[0]))
  } catch (err) {
    console.error('Update settings error:', err)
    res.status(500).json({ error: 'Failed to update settings' })
  }
})

export default router
