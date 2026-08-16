import { Router } from 'express'
import { query } from '../db/index.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const totals = await query(`
      SELECT
        COUNT(*)::int AS total_invoices,
        COALESCE(SUM(total), 0) AS total_revenue,
        COALESCE(SUM(cgst_amount + sgst_amount), 0) AS total_gst,
        COALESCE(SUM(subtotal), 0) AS total_subtotal,
        COUNT(DISTINCT client_name)::int AS total_clients,
        COUNT(*) FILTER (WHERE invoice_date >= CURRENT_DATE - INTERVAL '30 days')::int AS invoices_last_30_days
      FROM invoices
    `)

    const recent = await query(`
      SELECT invoice_number, client_name, invoice_date, total
      FROM invoices
      ORDER BY invoice_date DESC, id DESC
      LIMIT 6
    `)

    const byMonth = await query(`
      SELECT
        TO_CHAR(invoice_date, 'YYYY-MM') AS month,
        COUNT(*)::int AS count,
        COALESCE(SUM(total), 0) AS revenue
      FROM invoices
      GROUP BY month
      ORDER BY month DESC
      LIMIT 6
    `)

    res.json({
      ...totals.rows[0],
      recentInvoices: recent.rows,
      monthlyTrend: byMonth.rows.reverse(),
    })
  } catch (err) {
    console.error('Stats error:', err)
    res.status(500).json({ error: 'Failed to load stats' })
  }
})

export default router
