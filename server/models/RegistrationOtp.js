import mongoose from 'mongoose'

const registrationOtpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, index: true },
    codeHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    attemptCount: { type: Number, default: 0 },
    usedAt: { type: Date, default: null },
  },
  { timestamps: true },
)

registrationOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export default mongoose.models.RegistrationOtp ||
  mongoose.model('RegistrationOtp', registrationOtpSchema)