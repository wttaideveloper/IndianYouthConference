/**
 * Tiny in-memory sliding-window rate limiter keyed by a string (e.g. normalized email).
 * State is lost on server restart, which is acceptable for this scale.
 */
const buckets = new Map()

/**
 * @param {string} key      identifier (email / ip) to limit
 * @param {number} max      max allowed requests in the window
 * @param {number} windowMs window length in milliseconds
 * @returns {{ok: boolean, remaining: number, retryAfterMs: number}}
 */
export function rateLimitHit(key, max, windowMs) {
  const now = Date.now()
  const cutoff = now - windowMs

  let hits = buckets.get(key) || []

  // keep only hits inside the current window
  hits = hits.filter((t) => t > cutoff)

  if (hits.length >= max) {
    const retryAfterMs = hits[0] + windowMs - now
    buckets.set(key, hits)
    return { ok: false, remaining: 0, retryAfterMs: Math.max(0, Math.ceil(retryAfterMs / 1000) * 1000) }
  }

  hits.push(now)
  buckets.set(key, hits)
  return { ok: true, remaining: max - hits.length, retryAfterMs: 0 }
}

/** Wipe all counters (useful for tests / restarts). */
export function resetRateLimits() {
  buckets.clear()
}