import { useEffect, useState } from 'react'
import { api, formatINR } from './api'

export default function Overview({ refreshKey }) {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api('/api/stats')
      .then(setStats)
      .catch((e) => setError(e.message))
  }, [refreshKey])

  if (error) return <p className="text-red-600">{error}</p>
  if (!stats) return <p className="text-gray-500">Loading...</p>

  const cards = [
    { label: 'Total Invoices', value: stats.total_invoices, color: 'bg-blue-600' },
    { label: 'Total Revenue', value: formatINR(stats.total_revenue), color: 'bg-green-600' },
    { label: 'Total GST Collected', value: formatINR(stats.total_gst), color: 'bg-indigo-600' },
    { label: 'Unique Clients', value: stats.total_clients, color: 'bg-purple-600' },
  ]

  const maxRevenue = Math.max(...stats.monthlyTrend.map((m) => Number(m.revenue)), 1)

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-lg shadow p-5">
            <p className="text-sm text-gray-500">{c.label}</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow p-5">
          <h3 className="font-bold text-gray-800 mb-3">Revenue (last 6 months)</h3>
          {stats.monthlyTrend.length === 0 ? (
            <p className="text-gray-400 text-sm">No data yet</p>
          ) : (
            <div className="flex items-end gap-3 h-40">
              {stats.monthlyTrend.map((m) => (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-semibold text-gray-600">₹{Math.round(Number(m.revenue) / 1000)}k</span>
                  <div
                    className="w-full bg-blue-500 rounded-t"
                    style={{ height: `${Math.max(4, (Number(m.revenue) / maxRevenue) * 120)}px` }}
                  />
                  <span className="text-xs text-gray-400">{m.month}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-5">
          <h3 className="font-bold text-gray-800 mb-3">Recent Invoices</h3>
          {stats.recentInvoices.length === 0 ? (
            <p className="text-gray-400 text-sm">No invoices yet</p>
          ) : (
            <ul className="divide-y">
              {stats.recentInvoices.map((r) => (
                <li key={r.invoice_number} className="flex justify-between items-center py-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{r.invoice_number}</p>
                    <p className="text-xs text-gray-500">{r.client_name} · {r.invoice_date}</p>
                  </div>
                  <span className="text-sm font-bold text-gray-800">{formatINR(r.total)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
