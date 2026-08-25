import jwt from 'jsonwebtoken'

const ALLOWED_ROLES = new Set(['admin', 'viewer'])

export function requireAdmin(req, res, next) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required' })
  }

  const token = header.slice(7)
  const secret = process.env.JWT_SECRET

  if (!secret) {
    return res.status(500).json({ success: false, message: 'JWT_SECRET is not configured' })
  }

  try {
    const payload = jwt.verify(token, secret)
    if (!ALLOWED_ROLES.has(payload.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' })
    }
    req.admin = payload
    next()
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' })
  }
}

export function requireRole(role) {
  return (req, res, next) => {
    if (!req.admin || req.admin.role !== role) {
      return res.status(403).json({ success: false, message: 'Read-only access. This action requires admin privileges.' })
    }
    next()
  }
}
