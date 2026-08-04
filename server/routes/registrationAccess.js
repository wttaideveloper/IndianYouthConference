import { Router } from 'express'
import multer from 'multer'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import Registration from '../models/Registration.js'
import RegistrationOtp from '../models/RegistrationOtp.js'
import AttendeeSession from '../models/AttendeeSession.js'
import { isDBConnected } from '../db.js'
import { requireAttendee, SESSION_COOKIE } from '../middleware/attendeeAuth.js'
import {
  generateOtp,
  generateSessionToken,
  hashValue,
  verifyHash,
} from '../lib/crypto.js'
import { paymentState, canUploadPaymentProof } from '../lib/paymentState.js'
import { rateLimitHit } from '../lib/rateLimit.js'
import { sendOtpEmail, sendAdminRegistrationNotification } from '../mailer.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const uploadsDir = path.join(__dirname, '..', 'uploads')
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`
    const ext = path.extname(file.originalname) || '.jpg'
    cb(null, `payment-${unique}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (allowed.includes(file.mimetype)) cb(null, true)
    else cb(new Error('Only JPG, PNG or WEBP images are allowed'))
  },
})

const router = Router()

const OTP_TTL_MS = 10 * 60 * 1000
const OTP_MAX_ATTEMPTS = 5
const SESSION_TTL_MS = 20 * 60 * 1000
const isSecureCookie =
  process.env.COOKIE_SECURE === 'true' ||
  (process.env.COOKIE_SECURE !== 'false' && process.env.NODE_ENV === 'production')

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase()
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

/** Public projection shown to the attendee (never leaks address/phone/emergency/notes). */
const PUBLIC_FIELDS =
  'firstName lastName fullName gender fee feeLabel sectionConference ' +
  'arrivalDate departureDate programPreference paymentOption status createdAt paymentScreenshot'

function toAttendeeView(reg) {
  const state = paymentState(reg)
  return {
    _id: reg._id,
    firstName: reg.firstName,
    lastName: reg.lastName,
    fullName: reg.fullName,
    gender: reg.gender,
    fee: reg.fee,
    feeLabel: reg.feeLabel,
    sectionConference: reg.sectionConference,
    arrivalDate: reg.arrivalDate,
    departureDate: reg.departureDate,
    programPreference: reg.programPreference,
    paymentOption: reg.paymentOption,
    status: reg.status,
    createdAt: reg.createdAt,
    paymentState: state,
    canUploadPaymentProof: canUploadPaymentProof(state),
  }
}

const setSessionCookie = (res, token, expiresAt) => {
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isSecureCookie,
    sameSite: 'Lax',
    expires: expiresAt,
    path: '/',
  })
}

/**
 * POST /api/registration-access/otp/request
 * Body: { email }
 * Always returns the same generic response so this endpoint cannot leak whether an
 * email is registered. An OTP is emailed only when a registration exists.
 */
router.post('/otp/request', async (req, res) => {
  if (!isDBConnected()) {
    return res.status(503).json({ success: false, message: 'Service unavailable. Try again later.' })
  }

  const email = normalizeEmail(req.body?.email)
  const generic = {
    success: true,
    message: 'If an active registration exists for this email, we have sent you a verification code.',
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ success: false, message: 'A valid email address is required.' })
  }

  const emailLimit = rateLimitHit(`otp:req:${email}`, 3, 10 * 60 * 1000)
  const ipLimit = rateLimitHit(`otp:req:ip:${req.ip}`, 10, 10 * 60 * 1000)
  if (!emailLimit.ok || !ipLimit.ok) {
    return res.status(429).json({
      success: false,
      message: 'Too many requests. Please try again in a few minutes.',
    })
  }

  const reg = await Registration.findOne({ email }).select('email fullName fee paymentOption').lean()
  if (!reg) {
    return res.json(generic)
  }

  // Only one active code per email at a time.
  await RegistrationOtp.deleteMany({ email, usedAt: null })

  const otp = generateOtp(6)
  await RegistrationOtp.create({
    email,
    codeHash: hashValue(otp),
    expiresAt: new Date(Date.now() + OTP_TTL_MS),
    attemptCount: 0,
  })

  try {
    await sendOtpEmail({
      email,
      otp,
      fullName: reg.fullName,
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    })
  } catch (err) {
    console.error('OTP email failed:', err.message)
    return res.status(500).json({ success: false, message: 'Could not send the verification code. Please try again.' })
  }

  return res.json(generic)
})

/**
 * POST /api/registration-access/otp/verify
 * Body: { email, otp }
 * Validates a single-use 6-digit code (10-min expiry, max 5 attempts). On success,
 * creates a 20-minute attendee session, sets it as an HttpOnly cookie, and returns
 * only { success, expiresAt } (the token is never returned in the body).
 */
router.post('/otp/verify', async (req, res) => {
  if (!isDBConnected()) {
    return res.status(503).json({ success: false, message: 'Service unavailable. Try again later.' })
  }

  const email = normalizeEmail(req.body?.email)
  const otp = String(req.body?.otp || '').trim()

  if (!isValidEmail(email) || !/^\d{6}$/.test(otp)) {
    return res.status(400).json({ success: false, message: 'Enter the 6-digit code sent to your email.' })
  }

  const verifyLimit = rateLimitHit(`otp:ver:${email}`, 5, 15 * 60 * 1000)
  if (!verifyLimit.ok) {
    return res.status(429).json({ success: false, message: 'Too many attempts. Please try again later.' })
  }

  const record = await RegistrationOtp.findOne({ email }).sort({ createdAt: -1 })
  if (!record) {
    return res.status(400).json({ success: false, message: 'No active code found. Please request a new one.' })
  }

  if (record.usedAt) {
    return res.status(400).json({ success: false, message: 'This code has already been used.' })
  }
  if (record.expiresAt.getTime() <= Date.now()) {
    await RegistrationOtp.deleteOne({ _id: record._id })
    return res.status(400).json({ success: false, message: 'This code has expired. Please request a new one.' })
  }

  if (record.attemptCount >= OTP_MAX_ATTEMPTS) {
    return res.status(429).json({ success: false, message: 'Too many incorrect attempts. Please request a new code.' })
  }

  if (!verifyHash(otp, record.codeHash)) {
    await RegistrationOtp.updateOne({ _id: record._id }, { $inc: { attemptCount: 1 } })
    return res.status(400).json({ success: false, message: 'Incorrect code. Please try again.' })
  }

  // Single-use: remove the code so it cannot be reused.
  await RegistrationOtp.deleteOne({ _id: record._id })

  const token = generateSessionToken()
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS)
  await AttendeeSession.create({ email, tokenHash: hashValue(token), expiresAt })
  setSessionCookie(res, token, expiresAt)

  return res.json({ success: true, message: 'Verified successfully.', expiresAt })
})

/**
 * GET /api/registration-access/registrations
 * Requires an attendee session. Returns the attendee's registrations with derived
 * paymentState + canUploadPaymentProof, exposing only public fields.
 */
router.get('/registrations', requireAttendee, async (_req, res) => {
  if (!isDBConnected()) {
    return res.status(503).json({ success: false, message: 'Service unavailable. Try again later.' })
  }

  const email = _req.attendee.email
  const items = await Registration.find({ email })
    .sort({ createdAt: -1 })
    .select(PUBLIC_FIELDS)
    .lean()

  return res.json({ success: true, items: items.map(toAttendeeView) })
})

/**
 * POST /api/registration-access/registrations/:id/payment-proof
 * Requires an attendee session. Attach (or replace) payment proof for a registration
 * owned by the attendee, but only while its state is not_submitted or rejected.
 * On upload the registration becomes pay_now + pending and admin is notified.
 */
router.post('/registrations/:id/payment-proof', requireAttendee, upload.single('paymentScreenshot'), async (req, res) => {
  if (!isDBConnected()) {
    if (req.file?.path) fs.unlink(req.file.path, () => {})
    return res.status(503).json({ success: false, message: 'Service unavailable. Try again later.' })
  }

  if (!req.file) {
    return res.status(400).json({ success: false, errors: ['Payment screenshot is required.'] })
  }

  try {
    const reg = await Registration.findOne({ _id: req.params.id, email: req.attendee.email })
    if (!reg) {
      return res.status(404).json({ success: false, message: 'Registration not found.' })
    }

    const state = paymentState(reg)
    if (!canUploadPaymentProof(state)) {
      return res.status(400).json({
        success: false,
        errors: [`Payment proof cannot be changed while your registration is ${state.replace('_', ' ')}.`],
      })
    }

    // Replace an older rejected proof file (safe cleanup, never fails the request).
    const oldPath = reg.paymentScreenshot?.path
    if (oldPath && oldPath !== req.file.path && fs.existsSync(oldPath)) {
      fs.unlink(oldPath, () => {})
    }

    const updated = await Registration.findByIdAndUpdate(
      reg._id,
      {
        $set: {
          paymentOption: 'pay_now',
          status: 'pending',
          paymentScreenshot: {
            path: req.file.path,
            filename: req.file.filename,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
          },
        },
      },
      { new: true },
    ).select(PUBLIC_FIELDS).lean()

    // Notify admin; a send failure must not undo the successful upload.
    try {
      const recipient = updated
      await sendAdminRegistrationNotification({
        fullName: recipient.fullName,
        gender: recipient.gender,
        phone: '(hidden)', // attendee proof-upload path does not expose full contact fields
        email: recipient.email,
        streetAddress: '',
        streetAddress2: '',
        city: '',
        state: '',
        postalCode: '',
        sectionConference: recipient.sectionConference,
        occupation: '',
        fee: recipient.fee,
        feeLabel: recipient.feeLabel,
        paymentOption: 'pay_now',
        arrivalDate: recipient.arrivalDate,
        departureDate: recipient.departureDate,
        programPreference: recipient.programPreference,
        howDidYouKnow: '',
        pastAttendance: '',
        emergencyContactName: '',
        emergencyContactNumber: '',
        paymentScreenshot: {
          path: req.file.path,
          filename: req.file.filename,
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
        },
      })
    } catch (emailErr) {
      console.error('Proof-upload admin notification failed (upload saved):', emailErr.message)
    }

    return res.json({ success: true, message: 'Payment proof submitted. Our team will review it.', item: toAttendeeView(updated) })
  } catch (err) {
    if (req.file?.path) fs.unlink(req.file.path, () => {})
    console.error('Payment proof upload error:', err.message)
    return res.status(500).json({ success: false, message: 'Failed to submit payment proof. Please try again.' })
  }
})

export default router