import express from 'express'
import cors from 'cors'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

import authRoutes from './routes/auth.js'
import invoiceRoutes from './routes/invoices.js'
import settingsRoutes from './routes/settings.js'
import statsRoutes from './routes/stats.js'
import { requireAuth } from './middleware/auth.js'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()
const PORT = Number(process.env.PORT || 5000)

app.use(cors({ origin: true, credentials: true }))
app.use(express.json({ limit: '2mb' }))

// API health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'invoice-generator-backend', time: new Date().toISOString() })
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/invoices', requireAuth, invoiceRoutes)
app.use('/api/settings', requireAuth, settingsRoutes)
app.use('/api/stats', requireAuth, statsRoutes)

// Frontend app (built React + admin dashboard, copied from Vite `public/`)
const frontendDist = path.join(__dirname, '..', 'dist')
app.use(express.static(frontendDist))
app.get('/', (req, res) => res.sendFile(path.join(frontendDist, 'index.html')))
app.get('/app', (req, res) => res.redirect('/'))

// 404 for unknown API routes
app.use('/api', (req, res) => res.status(404).json({ error: 'Route not found' }))

app.listen(PORT, () => {
  console.log(`✓ Backend running at http://localhost:${PORT}`)
  console.log(`  Admin dashboard: http://localhost:${PORT}/admin/`)
})
