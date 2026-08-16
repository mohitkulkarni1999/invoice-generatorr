import { useEffect, useState } from 'react'
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
  const [sidebarOpen, setSidebarOpen] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= 768
  )

  const refresh = () => setRefreshKey((k) => k + 1)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const onChange = (e) => {
      if (e.matches) setSidebarOpen(true)
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const selectTab = (id) => {
    setTab(id)
    if (window.innerWidth < 768) setSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white border-b px-4 sm:px-6 h-14 flex items-center justify-between gap-3 sticky top-0 z-50">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => setSidebarOpen((o) => !o)}
            aria-label="Toggle sidebar"
            className="text-gray-600 hover:text-gray-900 text-xl leading-none shrink-0 p-1 -ml-1"
          >
            {sidebarOpen ? '✕' : '☰'}
          </button>
          <div className="flex items-center gap-2 font-bold text-gray-800 truncate">
            <span>💰</span>
            <span className="truncate">Invoice Generator</span>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium shrink-0">Admin</span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-600 shrink-0">
          <span className="font-medium truncate">{admin}</span>
          <button onClick={onLogout} className="text-red-600 hover:text-red-700 font-medium whitespace-nowrap">Logout</button>
        </div>
      </header>

      <div className="flex flex-1 flex-col md:flex-row">
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        <aside
          className={`fixed md:static inset-y-0 left-0 z-50 md:z-auto w-56 bg-white md:border-r p-3 flex flex-col overflow-y-auto transition-transform duration-200 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0 ${sidebarOpen ? '' : 'md:hidden'}`}
        >
          <div className="flex items-center justify-between mb-2 md:hidden">
            <span className="font-bold text-gray-800">Menu</span>
            <button
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
              className="text-gray-500 hover:text-gray-700 text-lg leading-none px-1"
            >
              ✕
            </button>
          </div>
          <div className="space-y-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => selectTab(t.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  tab === t.id ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span>{t.icon}</span> {t.label}
              </button>
            ))}
          </div>
        </aside>

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {tab === 'overview' && <Overview refreshKey={refreshKey} />}
          {tab === 'generate' && <GenerateInvoice onSaved={refresh} />}
          {tab === 'invoices' && <Invoices refreshKey={refreshKey} />}
          {tab === 'settings' && <Settings />}
        </main>
      </div>
    </div>
  )
}
