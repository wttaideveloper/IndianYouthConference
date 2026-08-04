import mongoose from 'mongoose'

const attendeeSessionSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
)

attendeeSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export default mongoose.models.AttendeeSession ||
  mongoose.model('AttendeeSession', attendeeSessionSchema)