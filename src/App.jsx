import { useState } from 'react'
import Login from './components/admin/Login'
import Dashboard from './components/admin/Dashboard'
import { getToken, setAuth, clearAuth } from './components/admin/api'

function App() {
  const [token, setToken] = useState(getToken())
  const [admin, setAdmin] = useState(localStorage.getItem('adminUser') || 'admin')

  const handleLogin = (t, u) => {
    setAuth(t, u)
    setToken(t)
    setAdmin(u)
  }

  const handleLogout = () => {
    clearAuth()
    setToken('')
  }

  return token ? <Dashboard admin={admin} onLogout={handleLogout} /> : <Login onLogin={handleLogin} />
}

export default App
