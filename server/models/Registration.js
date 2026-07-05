import mongoose from 'mongoose'

const registrationSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    fullName: { type: String, required: true },
    gender: { type: String, enum: ['Male', 'Female'], required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    streetAddress: { type: String, required: true },
    streetAddress2: { type: String, default: '' },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    sectionConference: { type: String, required: true },
    occupation: {
      type: String,
      enum: ['Student', 'Pastor', 'Missionary Volunteer', 'Working', 'Dependent'],
      required: true,
    },
    arrivalDate: { type: String, required: true },
    departureDate: { type: String, required: true },
    programPreference: {
      type: String,
      enum: ['All the Days', 'Only Over the Weekend'],
      default: 'All the Days',
    },
    howDidYouKnow: {
      type: String,
      enum: ['Facebook', 'WhatsApp', 'Instagram', 'Other'],
      required: true,
    },
    pastAttendance: { type: String, enum: ['Yes', 'No'], required: true },
    emergencyContactName: { type: String, required: true },
    emergencyContactNumber: { type: String, required: true },
    fee: { type: Number, required: true },
    feeLabel: { type: String, required: true },
    paymentScreenshot: {
      filename: String,
      originalname: String,
      mimetype: String,
      path: String,
    },
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    adminNotes: { type: String, default: '' },
    emailSent: { type: Boolean, default: false },
    verificationEmailSent: { type: Boolean, default: false },
    rejectionEmailSent: { type: Boolean, default: false },
  },
  { timestamps: true },
)

registrationSchema.index({ email: 1 })
registrationSchema.index({ status: 1 })
registrationSchema.index({ occupation: 1 })
registrationSchema.index({ createdAt: -1 })

export default mongoose.models.Registration ||
  mongoose.model('Registration', registrationSchema)
