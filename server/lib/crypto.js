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

/** Generate a storage filename from a trusted MIME type, never from the original name. */
export function generatePaymentProofFilename(mimetype) {
  const extensions = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
  }
  const extension = extensions[mimetype]

  if (!extension) throw new Error('Unsupported payment-proof MIME type')

  return `${crypto.randomBytes(32).toString('hex')}${extension}`
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
