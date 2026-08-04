import RegistrationAccessRateLimit from '../models/RegistrationAccessRateLimit.js'
import { hmacValue } from './crypto.js'

function hashRateLimitKey(scope, key, pepper) {
  return hmacValue(`${scope}:${String(key || '').trim()}`, pepper)
}

async function ensureBucket({ scope, keyHash, expiresAt }) {
  try {
    return await RegistrationAccessRateLimit.findOneAndUpdate(
      { scope, keyHash },
      {
        $setOnInsert: {
          scope,
          keyHash,
          count: 0,
          lastHitAt: new Date(0),
          expiresAt,
        },
      },
      { new: true, upsert: true },
    )
  } catch (err) {
    // A concurrent first request can race the unique index; use the winner's bucket.
    if (err?.code !== 11000) throw err
    return RegistrationAccessRateLimit.findOne({ scope, keyHash })
  }
}

/**
 * Atomically consume one fixed-window rate-limit slot. Identifier values are HMACed
 * before persistence, so the limiter collection never stores raw emails or IPs.
 */
export async function hitRateLimit({ scope, key, limit, windowMs, pepper }) {
  if (!scope || !pepper || !Number.isInteger(limit) || limit < 1 || windowMs < 1) {
    throw new Error('Invalid rate-limit configuration')
  }

  const now = new Date()
  const expiresAt = new Date(now.getTime() + windowMs)
  const keyHash = hashRateLimitKey(scope, key, pepper)

  const bucket = await ensureBucket({ scope, keyHash, expiresAt })
  if (!bucket) throw new Error('Failed to initialize rate-limit bucket')

  // Exactly one caller can reset an expired bucket before new hits are consumed.
  await RegistrationAccessRateLimit.updateOne(
    { scope, keyHash, expiresAt: { $lte: now } },
    {
      $set: {
        count: 0,
        lastHitAt: new Date(0),
        expiresAt,
      },
    },
  )

  const updated = await RegistrationAccessRateLimit.findOneAndUpdate(
    {
      scope,
      keyHash,
      expiresAt: { $gt: now },
      count: { $lt: limit },
    },
    {
      $inc: { count: 1 },
      $set: { lastHitAt: now },
    },
    { new: true },
  ).lean()

  if (updated) {
    return {
      allowed: true,
      remaining: Math.max(0, limit - updated.count),
      retryAfterMs: 0,
    }
  }

  const current = await RegistrationAccessRateLimit.findOne({ scope, keyHash }).lean()
  const retryAfterMs = current?.expiresAt
    ? Math.max(0, new Date(current.expiresAt).getTime() - now.getTime())
    : windowMs

  return { allowed: false, remaining: 0, retryAfterMs }
}

/** Consume a single slot in a cooldown window. */
export function enforceCooldown({ scope, key, cooldownMs, pepper }) {
  return hitRateLimit({ scope, key, limit: 1, windowMs: cooldownMs, pepper })
}
