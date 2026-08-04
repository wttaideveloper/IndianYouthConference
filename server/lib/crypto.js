import crypto from 'crypto'

/** Generate a cryptographically random N-digit numeric OTP. */
export function generateOtp(length = 8) {
  const max = 10 ** length
  return String(crypto.randomInt(0, max)).padStart(length, '0')
}

/** Return a random URL-safe opaque token for a one-time attendee session. */
export function generateSessionToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('base64url')
}

/**
 * HMAC-SHA256 hex of a value keyed by a server-side pepper — used so OTPs and
 * session tokens are never stored in plaintext and are pepper-protected.
 */
export function hmacValue(value, pepper) {
  return crypto.createHmac('sha256', String(pepper)).update(String(value)).digest('hex')
}

/** Constant-time compare of a plaintext candidate against a stored HMAC hex digest. */
export function verifyHash(candidate, digest, pepper) {
  const candidateDigest = hmacValue(candidate, pepper)
  const a = Buffer.from(candidateDigest)
  const b = Buffer.from(digest)
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}