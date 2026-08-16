import { useCallback, useEffect, useState } from 'react'
import { api, formatINR } from './api'

export default function Invoices({ refreshKey }) {
  const [invoices, setInvoices] = useState([])
  const [search, setSearch] = useState('')
  const [filterMode, setFilterMode] = useState('all')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [month, setMonth] = useState('')
  const [year, setYear] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const p = new URLSearchParams()
      if (search.trim()) p.set('search', search.trim())
      if (filterMode === 'date') {
        if (from) p.set('from', from)
        if (to) p.set('to', to)
      } else if (filterMode === 'month' && month) {
        p.set('month', month)
      } else if (filterMode === 'year' && year) {
        p.set('year', year)
      }
      const q = p.toString()
      setInvoices(await api(`/api/invoices${q ? `?${q}` : ''}`))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [search, filterMode, from, to, month, year])

  useEffect(() => {
    load()
  }, [load, refreshKey])

  const remove = async (id) => {
    try {
      await api(`/api/invoices/${id}`, { method: 'DELETE' })
      setConfirmDelete(null)
      load()
    } catch (e) {
      setError(e.message)
    }
  }

  const exportJson = (inv) => {
    const blob = new Blob([JSON.stringify(inv, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${inv.invoiceNumber}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h2 className="text-xl font-bold text-gray-800">Invoices</h2>
        {!loading && (
          <span className="text-xs text-gray-500">
            {invoices.length} invoice{invoices.length === 1 ? '' : 's'} found
          </span>
        )}
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-100 p-3 sm:p-4 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoice, client or company..."
            className="w-full lg:w-80 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: 'All' },
              { id: 'date', label: 'By Date' },
              { id: 'month', label: 'By Month' },
              { id: 'year', label: 'By Year' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setFilterMode(m.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filterMode === m.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {m.label}
              </button>
            ))}
            {(filterMode !== 'all' || from || to || month || year) && (
              <button
                onClick={() => {
                  setFilterMode('all')
                  setFrom('')
                  setTo('')
                  setMonth('')
                  setYear('')
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {filterMode === 'date' && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500 w-9 shrink-0">From</span>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="flex-1 sm:flex-none px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500 w-9 shrink-0">To</span>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="flex-1 sm:flex-none px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
        )}

        {filterMode === 'month' && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500 w-16 shrink-0">Month</span>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        )}

        {filterMode === 'year' && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500 w-16 shrink-0">Year</span>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
            >
              <option value="">Select year</option>
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>}
      {loading && <p className="text-gray-500 text-sm">Loading...</p>}
      {!loading && invoices.length === 0 && <p className="text-gray-400">No invoices found.</p>}

      {!loading && invoices.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500 border-b">
              <tr>
                <th className="px-4 py-3 font-medium">Invoice #</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Client</th>
                <th className="px-4 py-3 font-medium text-right">Total</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold text-gray-800">{inv.invoiceNumber}</td>
                  <td className="px-4 py-3 text-gray-600">{inv.invoiceDate}</td>
                  <td className="px-4 py-3 text-gray-600">{inv.clientName}</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-800">{formatINR(Math.round(inv.total))}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setSelected(inv)} className="text-blue-600 hover:text-blue-700 font-medium">
                        View
                      </button>
                      <button onClick={() => setConfirmDelete(inv)} className="text-red-600 hover:text-red-700 font-medium">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-3 border-b sticky top-0 bg-white">
              <h3 className="font-bold text-gray-800">{selected.invoiceNumber}</h3>
              <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-gray-700 text-lg leading-none">✕</button>
            </div>
            <div className="p-5 space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-xs uppercase font-semibold">From</p>
                  <p className="font-semibold text-gray-800">{selected.companyName}</p>
                  <p className="text-gray-600">{selected.companyAddress}</p>
                  <p className="text-gray-600">GSTIN: {selected.companyGSTIN} · PAN: {selected.companyPAN}</p>
                  <p className="text-gray-600">{selected.companyPhone} · {selected.companyEmail}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase font-semibold">Bill To</p>
                  <p className="font-semibold text-gray-800">{selected.clientName}</p>
                  <p className="text-gray-600">{selected.clientAddress}</p>
                  <p className="text-gray-600">GSTIN: {selected.clientGSTIN}</p>
                  <p className="text-gray-600">{selected.clientPhone}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="bg-gray-50 rounded p-2"><span className="text-gray-500">Date:</span> <span className="font-semibold text-gray-800">{selected.invoiceDate}</span></div>
                <div className="bg-gray-50 rounded p-2"><span className="text-gray-500">Due Date:</span> <span className="font-semibold text-gray-800">{selected.dueDate}</span></div>
                <div className="bg-gray-50 rounded p-2"><span className="text-gray-500">Total:</span> <span className="font-semibold text-gray-800">{formatINR(Math.round(selected.total))}</span></div>
              </div>

              <div>
                <p className="text-gray-500 text-xs uppercase font-semibold mb-2">Items</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                  <thead className="bg-gray-50 text-left text-gray-500">
                    <tr>
                      <th className="px-3 py-2 font-medium">Description</th>
                      <th className="px-3 py-2 font-medium">HSN</th>
                      <th className="px-3 py-2 font-medium text-right">Qty</th>
                      <th className="px-3 py-2 font-medium text-right">Rate</th>
                      <th className="px-3 py-2 font-medium text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {(selected.items || []).map((item, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2 text-gray-800">{item.description}</td>
                        <td className="px-3 py-2 text-gray-600">{item.hsnCode}</td>
                        <td className="px-3 py-2 text-right text-gray-600">{item.quantity}</td>
                        <td className="px-3 py-2 text-right text-gray-600">{formatINR(item.rate)}</td>
                        <td className="px-3 py-2 text-right font-semibold text-gray-800">{formatINR(item.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>

              <div className="flex justify-end">
                <div className="space-y-1 text-xs w-full sm:w-56">
                  <div className="flex justify-between"><span className="text-gray-500">Subtotal:</span><span className="font-semibold">{formatINR(selected.subtotal)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">CGST ({selected.cgstRate}%):</span><span className="font-semibold">{formatINR(selected.cgstAmount)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">SGST ({selected.sgstRate}%):</span><span className="font-semibold">{formatINR(selected.sgstAmount)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">P&amp;F:</span><span className="font-semibold">{formatINR(selected.pfCharge)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Delivery:</span><span className="font-semibold">{selected.deliveryCharge ? formatINR(selected.deliveryCharge) : 'No Delivery Charge'}</span></div>
                  <div className="flex justify-between border-t pt-1 font-bold text-gray-800"><span>Total:</span><span>{formatINR(Math.round(selected.total))}</span></div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded p-3">
                  <p className="text-gray-500 text-xs uppercase font-semibold mb-1">Bank Details</p>
                  <p className="text-gray-800">{selected.bankName}</p>
                  <p className="text-gray-600">A/C: {selected.accountNo} ({selected.accountType})</p>
                  <p className="text-gray-600">{selected.accountName} · IFSC: {selected.ifsc}</p>
                </div>
                <div className="bg-gray-50 rounded p-3">
                  <p className="text-gray-500 text-xs uppercase font-semibold mb-1">Notes &amp; Terms</p>
                  <p className="text-gray-600">{selected.notes}</p>
                  <p className="text-gray-600 mt-1">{selected.terms}</p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => exportJson(selected)} className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-4 py-2 rounded transition-colors text-sm">
                  Export JSON
                </button>
                <button onClick={() => setSelected(null)} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded transition-colors text-sm">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6">
            <h3 className="font-bold text-gray-800 mb-2">Delete Invoice</h3>
            <p className="text-sm text-gray-600 mb-4">Delete {confirmDelete.invoiceNumber}? This cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirmDelete(null)} className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-4 py-2 rounded transition-colors text-sm">
                Cancel
              </button>
              <button onClick={() => remove(confirmDelete.id)} className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded transition-colors text-sm">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
