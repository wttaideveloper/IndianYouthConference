import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const router = Router()

function getAdminUsers() {
  const raw = process.env.ADMIN_USERS_JSON
  if (raw) {
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
          .filter((u) => u && typeof u.username === 'string' && typeof u.password === 'string')
          .map((u) => ({
            username: String(u.username).trim(),
            password: String(u.password),
            role: u.role === 'viewer' ? 'viewer' : 'admin',
          }))
          .filter((u) => u.username && u.password)
      }
    } catch {
      // fall through to legacy single user
    }
  }
  const adminUser = process.env.ADMIN_USERNAME
  const adminPass = process.env.ADMIN_PASSWORD
  if (adminUser && adminPass) {
    return [{ username: adminUser, password: adminPass, role: 'admin' }]
  }
  return []
}

router.post('/login', async (req, res) => {
  const { username, password } = req.body
  const jwtSecret = process.env.JWT_SECRET
  const users = getAdminUsers()

  if (users.length === 0 || !jwtSecret) {
    return res.status(500).json({
      success: false,
      message: 'Admin credentials not configured. Set ADMIN_USERNAME/ADMIN_PASSWORD or ADMIN_USERS_JSON and JWT_SECRET in .env',
    })
  }

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required' })
  }

  const user = users.find((u) => u.username === username)
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' })
  }

  const passwordMatch =
    user.password.startsWith('$2')
      ? await bcrypt.compare(password, user.password)
      : password === user.password

  if (!passwordMatch) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' })
  }

  const token = jwt.sign({ role: user.role, username: user.username }, jwtSecret, { expiresIn: '7d' })

  res.json({ success: true, token, username: user.username, role: user.role })
})

export default router
