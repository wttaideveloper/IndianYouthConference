import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { connectDB } from './db.js'
import registerRouter from './routes/register.js'
import authRouter from './routes/auth.js'
import adminRouter from './routes/admin.js'
import registrationAccessRouter from './routes/registrationAccess.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '..', '.env') })

const PORT = process.env.PORT || 3001
const isProd = process.env.NODE_ENV === 'production'

const app = express()

if (process.env.APP_ORIGIN) {
  app.use(cors({ origin: process.env.APP_ORIGIN, credentials: true }))
}
app.use(express.json())
app.use(cookieParser())

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    mongo: Boolean(process.env.MONGODB_URI),
    admin: Boolean(process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD && process.env.JWT_SECRET),
  })
})

app.use('/api/register', registerRouter)
app.use('/api/auth', authRouter)
app.use('/api/admin', adminRouter)
app.use('/api/registration-access', registrationAccessRouter)

app.use('/api', (_req, res) => {
  res.status(404).json({ success: false, message: 'API endpoint not found' })
})

if (isProd) {
  const distPath = path.join(__dirname, '..', 'dist')
  app.use(express.static(distPath))
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

function validateRegistrationAccessConfig() {
  const missing = [
    !process.env.REGISTRATION_ACCESS_OTP_PEPPER && 'REGISTRATION_ACCESS_OTP_PEPPER',
    !process.env.REGISTRATION_ACCESS_TOKEN_PEPPER && 'REGISTRATION_ACCESS_TOKEN_PEPPER',
  ].filter(Boolean)

  if (missing.length === 0) return

  const message = `Registration access requires ${missing.join(' and ')}`
  if (isProd) throw new Error(message)

  console.error(`Warning: ${message}. Registration-access requests will be rejected until configured.`)
}

async function start() {
  validateRegistrationAccessConfig()
  const dbOk = await connectDB()

  await new Promise((resolve, reject) => {
    const server = app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`)
      if (!dbOk) {
        console.warn('Warning: MongoDB not connected. Registrations will not be saved until fixed.')
      }
      if (!process.env.SMTP_HOST) {
        console.warn('Warning: SMTP not configured. Email notifications disabled.')
      }
      if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD || !process.env.JWT_SECRET) {
        console.warn('Warning: Admin credentials missing. Set ADMIN_USERNAME, ADMIN_PASSWORD, JWT_SECRET in .env')
      } else {
        console.log(`Admin login enabled (user: ${process.env.ADMIN_USERNAME})`)
      }
      resolve(server)
    })

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Stop the other server (Ctrl+C old terminal) or run: npx kill-port ${PORT}`)
      }
      reject(err)
    })
  })
}

start().catch((err) => {
  console.error('Failed to start server:', err.message)
  process.exit(1)
})
