import { useEffect, useState } from 'react'
import { api, formatINR } from './api'

const CARDS = [
  { key: 'invoices', label: 'Total Invoices', icon: '🧾', sub: 'last30', color: 'from-blue-500 to-blue-600', iconBg: 'bg-blue-50 text-blue-600 ring-blue-100' },
  { key: 'revenue', label: 'Total Revenue', icon: '💰', sub: 'avg', color: 'from-green-500 to-emerald-600', iconBg: 'bg-green-50 text-green-600 ring-green-100' },
  { key: 'gst', label: 'Total GST Collected', icon: '🏛️', sub: 'subtotal', color: 'from-indigo-500 to-violet-600', iconBg: 'bg-indigo-50 text-indigo-600 ring-indigo-100' },
  { key: 'clients', label: 'Unique Clients', icon: '🤝', sub: 'across', color: 'from-purple-500 to-fuchsia-600', iconBg: 'bg-purple-50 text-purple-600 ring-purple-100' },
]

const monthLabel = (ym) => {
  if (!ym) return ''
  const [y, mo] = ym.split('-')
  const date = new Date(Number(y), Number(mo) - 1, 1)
  return date.toLocaleString('en-US', { month: 'short' })
}

const EmptyBox = ({ icon, title, subtitle }) => (
  <div className="flex flex-col items-center justify-center text-center py-10 px-4 border-2 border-dashed border-gray-200 rounded-xl">
    <div className="text-3xl mb-2">{icon}</div>
    <p className="text-sm font-semibold text-gray-500">{title}</p>
    <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
  </div>
)

export default function Overview({ refreshKey, onNavigate }) {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api('/api/stats')
      .then(setStats)
      .catch((e) => setError(e.message))
  }, [refreshKey])

  if (error) return <p className="text-red-600">{error}</p>
  if (!stats) return <p className="text-gray-500">Loading...</p>

  const cardValues = {
    invoices: stats.total_invoices,
    revenue: formatINR(stats.total_revenue),
    gst: formatINR(stats.total_gst),
    clients: stats.total_clients,
  }
  const cardSubs = {
    invoices: `${stats.invoices_last_30_days} in last 30 days`,
    revenue: `Avg ${formatINR(stats.avgInvoiceValue)} / invoice`,
    gst: `on ${formatINR(stats.total_subtotal)} taxable`,
    clients: 'across all invoices',
  }

  const maxRevenue = Math.max(...stats.monthlyTrend.map((m) => Number(m.revenue)), 1)
  const maxClientRevenue = Math.max(...stats.topClients.map((c) => Number(c.revenue)), 1)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-xl font-bold text-gray-800">Overview</h2>
        <button
          onClick={() => onNavigate && onNavigate('generate')}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-4 py-2 rounded-lg shadow-sm text-sm transition-all duration-200"
        >
          ＋ Generate Invoice
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {CARDS.map((c) => (
          <div key={c.key} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-start gap-4">
            <div className={`h-12 w-12 shrink-0 rounded-xl flex items-center justify-center text-2xl ring-4 ${c.iconBg}`}>
              {c.icon}
            </div>
            <div className="min-w-0">
              <p className="text-sm text-gray-500 font-medium truncate">{c.label}</p>
              <p className="text-2xl font-bold text-gray-800 mt-0.5 truncate">{cardValues[c.key]}</p>
              <p className="text-xs text-gray-400 mt-1 truncate">{cardSubs[c.key]}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">Revenue Trend</h3>
            <span className="text-xs text-gray-400">last 6 months</span>
          </div>
          {stats.monthlyTrend.length === 0 ? (
            <EmptyBox icon="📈" title="No revenue data yet" subtitle="Create an invoice to see trends here" />
          ) : (
            <div className="flex items-end gap-2 sm:gap-3 h-48">
              {stats.monthlyTrend.map((m) => (
                <div key={m.month} className="flex-1 flex flex-col items-center justify-end h-full gap-1 min-w-0">
                  <span className="text-[10px] sm:text-xs font-semibold text-gray-600 truncate">{Math.round(Number(m.revenue) / 1000)}k</span>
                  <div
                    className="w-full max-w-12 bg-gradient-to-t from-blue-500 to-indigo-400 rounded-t-md transition-all"
                    style={{ height: `${Math.max(4, (Number(m.revenue) / maxRevenue) * 130)}px` }}
                  />
                  <span className="text-[10px] sm:text-xs text-gray-400 truncate">{monthLabel(m.month)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">Top Clients</h3>
            <span className="text-xs text-gray-400">by revenue</span>
          </div>
          {stats.topClients.length === 0 ? (
            <EmptyBox icon="🤝" title="No clients yet" subtitle="Your top clients will appear here" />
          ) : (
            <ul className="space-y-4">
              {stats.topClients.map((c) => (
                <li key={c.client_name}>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-sm font-semibold text-gray-700 truncate">{c.client_name}</span>
                    <span className="text-sm font-bold text-gray-800 shrink-0">{formatINR(c.revenue)}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-2 bg-gradient-to-r from-purple-500 to-fuchsia-400 rounded-full transition-all"
                      style={{ width: `${Math.max(2, (Number(c.revenue) / maxClientRevenue) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400">{c.count} invoice{c.count === 1 ? '' : 's'}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">Recent Invoices</h3>
            <button
              onClick={() => onNavigate && onNavigate('invoices')}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
            >
              View all →
            </button>
          </div>
          {stats.recentInvoices.length === 0 ? (
            <EmptyBox icon="🧾" title="No invoices yet" subtitle="Create your first invoice to get started" />
          ) : (
            <ul className="divide-y">
              {stats.recentInvoices.map((r) => (
                <li key={r.invoice_number} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 shrink-0 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-bold">
                      {r.invoice_number.replace(/^[^0-9]*/, '').slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{r.invoice_number}</p>
                      <p className="text-xs text-gray-500 truncate">{r.client_name} · {r.invoice_date}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-gray-800 shrink-0">{formatINR(Math.round(r.total))}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl shadow-sm p-5 text-white">
          <h3 className="font-bold mb-1">Quick Actions</h3>
          <p className="text-sm text-white/80 mb-4">Common tasks to keep your billing on track.</p>
          <div className="space-y-2">
            <button
              onClick={() => onNavigate && onNavigate('generate')}
              className="w-full flex items-center justify-between gap-2 bg-white/15 hover:bg-white/25 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors"
            >
              <span>➕ New Invoice</span>
            </button>
            <button
              onClick={() => onNavigate && onNavigate('invoices')}
              className="w-full flex items-center justify-between gap-2 bg-white/15 hover:bg-white/25 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors"
            >
              <span>🧾 Manage Invoices</span>
            </button>
            <button
              onClick={() => onNavigate && onNavigate('settings')}
              className="w-full flex items-center justify-between gap-2 bg-white/15 hover:bg-white/25 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors"
            >
              <span>⚙️ Company Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
