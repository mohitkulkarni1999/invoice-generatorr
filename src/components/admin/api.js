const API_BASE = import.meta.env.VITE_API_URL || ''

export const getToken = () => localStorage.getItem('token') || ''

export const setAuth = (token, username) => {
  localStorage.setItem('token', token)
  localStorage.setItem('adminUser', username)
}

export const clearAuth = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('adminUser')
}

export const api = async (path, options = {}) => {
  const headers = { ...(options.headers || {}) }
  if (options.body) headers['Content-Type'] = 'application/json'
  if (getToken()) headers['Authorization'] = `Bearer ${getToken()}`

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  const data = await res.json().catch(() => ({}))

  if (res.status === 401 && !path.startsWith('/api/auth/login')) {
    clearAuth()
    window.location.reload()
    throw new Error('Session expired. Please login again.')
  }
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

export const formatINR = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(Number(amount) || 0)
