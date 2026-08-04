import mongoose from 'mongoose'

const registrationAccessRateLimitSchema = new mongoose.Schema(
  {
    scope: { type: String, required: true },
    keyHash: { type: String, required: true },
    count: { type: Number, required: true, default: 0 },
    lastHitAt: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: false },
)

registrationAccessRateLimitSchema.index({ scope: 1, keyHash: 1 }, { unique: true })
registrationAccessRateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export default mongoose.models.RegistrationAccessRateLimit ||
  mongoose.model('RegistrationAccessRateLimit', registrationAccessRateLimitSchema)
