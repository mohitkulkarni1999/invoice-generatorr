import { Router } from 'express'
import { query } from '../db/index.js'
import { toDbParams, mapDbToApi } from '../utils/invoice.js'

const router = Router()

const INSERT_COLS = `invoice_number, invoice_date, due_date,
  company_name, company_address, company_gstin, company_pan, company_phone, company_email,
  bank_name, account_no, account_name, account_type, ifsc,
  client_name, client_phone, client_address, client_gstin,
  items, cgst_rate, sgst_rate, pf_charge, delivery_charge, include_pf, include_delivery, notes, terms,
  subtotal, taxable_value, cgst_amount, sgst_amount, total`

router.get('/', async (req, res) => {
  try {
    const { search = '' } = req.query
    let sql = 'SELECT * FROM invoices'
    const params = []
    if (search.trim()) {
      sql += ` WHERE invoice_number ILIKE $1 OR client_name ILIKE $1 OR company_name ILIKE $1`
      params.push(`%${search.trim()}%`)
    }
    sql += ' ORDER BY invoice_date DESC, id DESC'
    const { rows } = await query(sql, params)
    res.json(rows.map(mapDbToApi))
  } catch (err) {
    console.error('List invoices error:', err)
    res.status(500).json({ error: 'Failed to fetch invoices' })
  }
})

router.get('/next-number', async (req, res) => {
  try {
    const { rows } = await query('SELECT COUNT(*)::int AS count FROM invoices')
    const seq = rows[0].count + 1
    const now = new Date()
    let fyStart = now.getFullYear()
    if (now.getMonth() < 3) fyStart -= 1
    const fy = `${String(fyStart).slice(-2)}-${String(fyStart + 1).slice(-2)}`
    res.json({ sequence: seq, invoiceNumber: `${seq}/${fy}` })
  } catch (err) {
    console.error('Next number error:', err)
    res.status(500).json({ error: 'Failed to generate invoice number' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM invoices WHERE id = $1', [req.params.id])
    if (!rows[0]) return res.status(404).json({ error: 'Invoice not found' })
    res.json(mapDbToApi(rows[0]))
  } catch (err) {
    console.error('Get invoice error:', err)
    res.status(500).json({ error: 'Failed to fetch invoice' })
  }
})

router.post('/', async (req, res) => {
  try {
    const data = req.body || {}
    if (!data.invoiceNumber || !data.clientName) {
      return res.status(400).json({ error: 'invoiceNumber and clientName are required' })
    }

    const p = toDbParams(data)
    const { rows } = await query(
      `INSERT INTO invoices (${INSERT_COLS}) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32) RETURNING *`,
      p
    )
    res.status(201).json(mapDbToApi(rows[0]))
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: `Invoice number already exists` })
    }
    console.error('Create invoice error:', err)
    res.status(500).json({ error: 'Failed to create invoice' })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const data = req.body || {}
    const { rows: existing } = await query('SELECT id FROM invoices WHERE id = $1', [req.params.id])
    if (!existing[0]) return res.status(404).json({ error: 'Invoice not found' })

    const p = toDbParams(data)
    const { rows } = await query(
      `UPDATE invoices SET
        invoice_number=$1, invoice_date=$2, due_date=$3,
        company_name=$4, company_address=$5, company_gstin=$6, company_pan=$7, company_phone=$8, company_email=$9,
        bank_name=$10, account_no=$11, account_name=$12, account_type=$13, ifsc=$14,
        client_name=$15, client_phone=$16, client_address=$17, client_gstin=$18,
        items=$19, cgst_rate=$20, sgst_rate=$21, pf_charge=$22, delivery_charge=$23, include_pf=$24, include_delivery=$25, notes=$26, terms=$27,
        subtotal=$28, taxable_value=$29, cgst_amount=$30, sgst_amount=$31, total=$32,
        updated_at=NOW()
      WHERE id=$33 RETURNING *`,
      [...p, req.params.id]
    )
    res.json(mapDbToApi(rows[0]))
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: `Invoice number already exists` })
    }
    console.error('Update invoice error:', err)
    res.status(500).json({ error: 'Failed to update invoice' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await query('DELETE FROM invoices WHERE id = $1', [req.params.id])
    if (rowCount === 0) return res.status(404).json({ error: 'Invoice not found' })
    res.json({ ok: true })
  } catch (err) {
    console.error('Delete invoice error:', err)
    res.status(500).json({ error: 'Failed to delete invoice' })
  }
})

export default router
