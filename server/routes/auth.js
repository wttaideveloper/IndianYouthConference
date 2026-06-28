import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const router = Router()

router.post('/login', async (req, res) => {
  const { username, password } = req.body

  const adminUser = process.env.ADMIN_USERNAME
  const adminPass = process.env.ADMIN_PASSWORD
  const jwtSecret = process.env.JWT_SECRET

  if (!adminUser || !adminPass || !jwtSecret) {
    return res.status(500).json({
      success: false,
      message: 'Admin credentials not configured. Set ADMIN_USERNAME, ADMIN_PASSWORD, and JWT_SECRET in .env',
    })
  }

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required' })
  }

  const usernameMatch = username === adminUser
  const passwordMatch =
    adminPass.startsWith('$2')
      ? await bcrypt.compare(password, adminPass)
      : password === adminPass

  if (!usernameMatch || !passwordMatch) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' })
  }

  const token = jwt.sign({ role: 'admin', username: adminUser }, jwtSecret, { expiresIn: '7d' })

  res.json({ success: true, token, username: adminUser })
})

export default router
