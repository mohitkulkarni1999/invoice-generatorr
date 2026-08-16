import { useEffect, useState } from 'react'
import { api } from './api'

const FIELDS = [
  { key: 'companyName', label: 'Company Name', type: 'text', full: true },
  { key: 'companyAddress', label: 'Company Address', type: 'textarea', full: true },
  { key: 'companyGSTIN', label: 'GSTIN', type: 'text' },
  { key: 'companyPAN', label: 'PAN Number', type: 'text' },
  { key: 'companyPhone', label: 'Phone', type: 'text' },
  { key: 'companyEmail', label: 'Email', type: 'email' },
  { key: 'bankName', label: 'Bank Name', type: 'text' },
  { key: 'accountNo', label: 'Account No', type: 'text' },
  { key: 'accountName', label: 'Account Name', type: 'text' },
  { key: 'accountType', label: 'Account Type', type: 'text' },
  { key: 'ifsc', label: 'IFSC Code', type: 'text' },
  { key: 'cgstRate', label: 'CGST (%)', type: 'number' },
  { key: 'sgstRate', label: 'SGST (%)', type: 'number' },
  { key: 'notes', label: 'Notes', type: 'textarea', full: true },
  { key: 'terms', label: 'Terms & Conditions', type: 'textarea', full: true },
]

const empty = FIELDS.reduce((acc, f) => ({ ...acc, [f.key]: '' }), {})

export default function Settings() {
  const [form, setForm] = useState(empty)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [status, setStatus] = useState({ type: '', message: '' })

  useEffect(() => {
    api('/api/settings')
      .then(setForm)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const save = async () => {
    setStatus({ type: '', message: '' })
    try {
      await api('/api/settings', { method: 'PUT', body: JSON.stringify(form) })
      setStatus({ type: 'success', message: 'Settings saved.' })
    } catch (e) {
      setStatus({ type: 'error', message: e.message })
    }
  }

  if (loading) return <p className="text-gray-500">Loading...</p>
  if (error) return <p className="text-red-600">{error}</p>

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800">Settings</h2>
      <p className="text-sm text-gray-500">These are the default company, bank and tax details. New invoices start from these.</p>

      <div className="bg-white rounded-lg shadow p-5 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {FIELDS.map((f) => (
            <div key={f.key} className={f.full ? 'md:col-span-2' : ''}>
              <label className="block text-xs font-medium text-gray-700 mb-1">{f.label}</label>
              {f.type === 'textarea' ? (
                <textarea
                  value={form[f.key] || ''}
                  onChange={(e) => set(f.key, e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <input
                  type={f.type}
                  value={form[f.key] || ''}
                  onChange={(e) => set(f.key, e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              )}
            </div>
          ))}
        </div>

        {status && status.message && (
          <div className={`text-sm px-3 py-2 rounded-lg border ${
            status.type === 'success'
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-red-50 text-red-700 border-red-200'
          }`}>
            {status.message}
          </div>
        )}

        <div className="flex justify-end">
          <button onClick={save} className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors">
            Save Settings
          </button>
        </div>
      </div>
    </div>
  )
}
