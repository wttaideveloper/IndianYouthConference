import AttendeeSession from '../models/AttendeeSession.js'
import { hmacValue } from '../lib/crypto.js'

const SESSION_COOKIE = 'iyc_attendee'
const SESSION_MAX_AGE_MS = 20 * 60 * 1000
const TOKEN_PEPPER = process.env.REGISTRATION_ACCESS_TOKEN_PEPPER

function attendeeCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' || process.env.COOKIE_SECURE === 'true',
    sameSite: 'lax',
    path: '/api/registration-access',
    maxAge: SESSION_MAX_AGE_MS,
  }
}

function setAttendeeSessionCookie(res, token) {
  res.cookie(SESSION_COOKIE, token, attendeeCookieOptions())
}

function clearAttendeeSessionCookie(res) {
  res.clearCookie(SESSION_COOKIE, attendeeCookieOptions())
}

/**
 * Verify the attendee session cookie and attach the verified { email, sessionId }
 * to the request. Rejects with 401 when missing/expired/invalid.
 */
export async function requireAttendee(req, res, next) {
  if (!TOKEN_PEPPER) {
    return res.status(500).json({
      success: false,
      message: 'Registration access is not configured. Set REGISTRATION_ACCESS_TOKEN_PEPPER.',
    })
  }

  const token = req.cookies && req.cookies[SESSION_COOKIE]
  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required' })
  }

  try {
    const tokenHash = hmacValue(token, TOKEN_PEPPER)
    const session = await AttendeeSession.findOne({ tokenHash })

    if (!session || session.expiresAt.getTime() <= Date.now()) {
      clearAttendeeSessionCookie(res)
      return res.status(401).json({ success: false, message: 'Session expired. Please sign in again.' })
    }

    req.attendee = { email: session.email }
    req.attendeeSession = session
    next()
  } catch (err) {
    console.error('Attendee auth error:', err.message)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

export { SESSION_COOKIE, setAttendeeSessionCookie }
