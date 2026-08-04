import mongoose from 'mongoose'

const adminEmailCampaignSchema = new mongoose.Schema(
  {
    adminId: { type: String, required: true },
    idempotencyKey: { type: String, required: true },
    audience: {
      type: String,
      enum: ['all', 'verified', 'payment_under_review', 'pay_later_unpaid', 'individual'],
      required: true,
    },
    registrationId: { type: mongoose.Schema.Types.ObjectId, default: null },
    subject: { type: String, required: true },
    messageHash: { type: String, required: true },
    status: {
      type: String,
      enum: ['processing', 'completed', 'failed'],
      default: 'processing',
    },
    recipientCount: { type: Number, required: true, default: 0 },
    sentCount: { type: Number, required: true, default: 0 },
    failedCount: { type: Number, required: true, default: 0 },
    skippedCount: { type: Number, required: true, default: 0 },
    startedAt: { type: Date, required: true, default: Date.now },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true },
)

adminEmailCampaignSchema.index({ adminId: 1, idempotencyKey: 1 }, { unique: true })
adminEmailCampaignSchema.index({ adminId: 1, startedAt: -1 })

export default mongoose.models.AdminEmailCampaign ||
  mongoose.model('AdminEmailCampaign', adminEmailCampaignSchema)
