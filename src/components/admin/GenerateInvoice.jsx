import { useEffect, useState } from 'react'
import InvoiceForm from '../InvoiceForm'
import InvoicePreview from '../InvoicePreview'
import { api } from './api'

const toLocalISODate = (d) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
}

const initialData = {
  invoiceNumber: '',
  invoiceDate: toLocalISODate(new Date()),
  dueDate: toLocalISODate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
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
  clientName: 'Reliance Digital Retail Ltd.',
  clientPhone: '+91 98765 43210',
  clientAddress: '3rd Floor, Phoenix Mall, Lower Parel, Mumbai, Maharashtra - 400013',
  clientGSTIN: '27AABCR7890M1Z6',
  items: [
    { description: 'Website Development Services', hsnCode: '998314', quantity: 1, rate: 75000, amount: 75000 },
    { description: 'Logo & Brand Identity Design', hsnCode: '998311', quantity: 2, rate: 15000, amount: 30000 },
  ],
  cgstRate: 9,
  sgstRate: 9,
  pfCharge: '100',
  deliveryCharge: '250',
  includePF: true,
  includeDelivery: true,
  notes: 'Thank you for your business! Please contact accounts@technova.in for any queries regarding this invoice.',
  terms: 'Payment is due within 30 days. Late payment subject to fees as per our terms and conditions.',
}

export default function GenerateInvoice({ onSaved }) {
  const [invoiceData, setInvoiceData] = useState(initialData)
  const [showPreview, setShowPreview] = useState(false)
  const [saveStatus, setSaveStatus] = useState({ type: '', message: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([
      api('/api/settings').catch(() => null),
      api('/api/invoices/next-number').catch(() => null),
    ]).then(([settings, num]) => {
      setInvoiceData((prev) => ({
        ...prev,
        ...(settings || {}),
        invoiceNumber: num && num.invoiceNumber ? num.invoiceNumber : prev.invoiceNumber,
      }))
    })
  }, [])

  const saveInvoice = async () => {
    setSaveStatus({ type: '', message: '' })
    if (!invoiceData.invoiceNumber.trim() || !invoiceData.clientName.trim()) {
      setSaveStatus({ type: 'error', message: 'Invoice number and client name are required to save.' })
      return
    }
    setSaving(true)
    try {
      const saved = await api('/api/invoices', { method: 'POST', body: JSON.stringify(invoiceData) })
      setSaveStatus({ type: 'success', message: `Invoice ${saved.invoiceNumber} saved successfully.` })
      onSaved()
    } catch (err) {
      setSaveStatus({ type: 'error', message: err.message })
    } finally {
      setSaving(false)
    }
  }

  if (showPreview) {
    return (
      <div>
        <div className="fixed top-4 left-4 z-50">
          <button
            onClick={() => setShowPreview(false)}
            className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 rounded-lg shadow-lg transition-all duration-200"
          >
            ← Back to Form
          </button>
        </div>
        <InvoicePreview invoiceData={invoiceData} />
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-4">Generate Invoice</h2>
      <InvoiceForm
        invoiceData={invoiceData}
        setInvoiceData={setInvoiceData}
        onPreview={() => setShowPreview(true)}
        onSave={saveInvoice}
        saving={saving}
        saveStatus={saveStatus}
      />
    </div>
  )
}
