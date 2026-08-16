const parseNum = (value) => {
  const n = parseFloat(value)
  return isNaN(n) ? 0 : n
}

export const parseDeliveryCharge = (value) => {
  if (!value) return { money: 0, display: 'No Delivery Charge' }
  const raw = value.toString().trim()
  const numericPart = raw.replace(/[^0-9.]/g, '')
  const num = parseFloat(numericPart)
  if (numericPart && !isNaN(num)) return { money: num, display: null }
  return { money: 0, display: raw }
}

export const computeTotals = (data) => {
  const items = Array.isArray(data.items) ? data.items : []
  const subtotal = items.reduce((sum, item) => sum + (parseNum(item.amount) || parseNum(item.quantity) * parseNum(item.rate)), 0)
  const includePF = data.includePF !== false
  const includeDelivery = data.includeDelivery !== false
  const pf = includePF ? parseNum(data.pfCharge) : 0
  const delivery = includeDelivery ? parseDeliveryCharge(data.deliveryCharge).money : 0
  const taxableValue = subtotal + pf + delivery
  const cgst = taxableValue * (parseNum(data.cgstRate) / 100)
  const sgst = taxableValue * (parseNum(data.sgstRate) / 100)
  const total = taxableValue + cgst + sgst

  return {
    subtotal: round2(subtotal),
    pfCharge: pf,
    deliveryChargeMoney: delivery,
    taxableValue: round2(taxableValue),
    cgst: round2(cgst),
    sgst: round2(sgst),
    total: round2(total),
  }
}

const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100

const mapDbToApi = (row) => ({
  id: row.id,
  invoiceNumber: row.invoice_number,
  invoiceDate: row.invoice_date ? toDateInput(row.invoice_date) : '',
  dueDate: row.due_date ? toDateInput(row.due_date) : '',
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
  clientName: row.client_name || '',
  clientPhone: row.client_phone || '',
  clientAddress: row.client_address || '',
  clientGSTIN: row.client_gstin || '',
  items: Array.isArray(row.items) ? row.items : [],
  cgstRate: String(row.cgst_rate),
  sgstRate: String(row.sgst_rate),
  pfCharge: String(row.pf_charge ?? ''),
  deliveryCharge: row.delivery_charge || '',
  includePF: row.include_pf !== false,
  includeDelivery: row.include_delivery !== false,
  notes: row.notes || '',
  terms: row.terms || '',
  subtotal: row.subtotal,
  taxableValue: row.taxable_value,
  cgstAmount: row.cgst_amount,
  sgstAmount: row.sgst_amount,
  total: row.total,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

const toDateInput = (date) => {
  if (date instanceof Date) {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }
  return String(date).slice(0, 10)
}

export const toDbParams = (data) => {
  const t = computeTotals(data)
  return [
    data.invoiceNumber || '',
    data.invoiceDate || null,
    data.dueDate || null,
    data.companyName || '',
    data.companyAddress || '',
    data.companyGSTIN || '',
    data.companyPAN || '',
    data.companyPhone || '',
    data.companyEmail || '',
    data.bankName || '',
    data.accountNo || '',
    data.accountName || '',
    data.accountType || '',
    data.ifsc || '',
    data.clientName || '',
    data.clientPhone || '',
    data.clientAddress || '',
    data.clientGSTIN || '',
    JSON.stringify(Array.isArray(data.items) ? data.items : []),
    parseNum(data.cgstRate),
    parseNum(data.sgstRate),
    t.pfCharge,
    data.deliveryCharge || '',
    data.includePF !== false,
    data.includeDelivery !== false,
    data.notes || '',
    data.terms || '',
    t.subtotal,
    t.taxableValue,
    t.cgst,
    t.sgst,
    t.total,
  ]
}

export { mapDbToApi }
