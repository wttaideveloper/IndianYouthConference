import crypto from 'crypto'

/** Generate a cryptographically random N-digit numeric OTP. */
export function generateOtp(length = 6) {
  const max = 10 ** length
  return String(crypto.randomInt(0, max)).padStart(length, '0')
}

/** Return a random URL-safe opaque token for a one-time attendee session. */
export function generateSessionToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('base64url')
}

/** sha256 hex of a value — used so OTPs and session tokens are never stored in plaintext. */
export function hashValue(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex')
}

/** Constant-time compare of a plaintext candidate against a stored sha256 hex digest. */
export function verifyHash(candidate, digest) {
  const candidateDigest = hashValue(candidate)
  const a = Buffer.from(candidateDigest)
  const b = Buffer.from(digest)
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}