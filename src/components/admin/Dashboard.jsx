import { useState } from 'react'
import Overview from './Overview'
import GenerateInvoice from './GenerateInvoice'
import Invoices from './Invoices'
import Settings from './Settings'

const TABS = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'generate', label: 'Generate Invoice', icon: '➕' },
  { id: 'invoices', label: 'Invoices', icon: '🧾' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
]

export default function Dashboard({ admin, onLogout }) {
  const [tab, setTab] = useState('overview')
  const [refreshKey, setRefreshKey] = useState(0)
  const refresh = () => setRefreshKey((k) => k + 1)

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white border-b px-6 h-14 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2 font-bold text-gray-800">
          <span>💰</span> Invoice Generator
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Admin</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <span className="font-medium">{admin}</span>
          <button onClick={onLogout} className="text-red-600 hover:text-red-700 font-medium">Logout</button>
        </div>
      </header>
      <div className="flex flex-1">
        <nav className="w-56 bg-white border-r p-3 space-y-1 shrink-0">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                tab === t.id ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </nav>
        <main className="flex-1 p-6 overflow-auto">
          {tab === 'overview' && <Overview refreshKey={refreshKey} />}
          {tab === 'generate' && <GenerateInvoice onSaved={refresh} />}
          {tab === 'invoices' && <Invoices refreshKey={refreshKey} />}
          {tab === 'settings' && <Settings />}
        </main>
      </div>
    </div>
  )
}
