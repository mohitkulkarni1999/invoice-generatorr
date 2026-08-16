import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { query } from '../db/index.js'
import { signToken } from '../middleware/auth.js'

const router = Router()

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body || {}
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' })
    }

    const { rows } = await query('SELECT * FROM admins WHERE username = $1', [username])
    const admin = rows[0]
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const ok = await bcrypt.compare(password, admin.password_hash)
    if (!ok) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = signToken(admin)
    res.json({ token, admin: { id: admin.id, username: admin.username } })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Something went wrong' })
  }
})

router.get('/me', (req, res) => {
  res.json({ admin: req.admin })
})

router.post('/logout', (req, res) => {
  res.json({ ok: true })
})

export default router
