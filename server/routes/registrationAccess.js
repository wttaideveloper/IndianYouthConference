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
  hmacValue,
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
const OTP_PEPPER = process.env.REGISTRATION_ACCESS_OTP_PEPPER
const TOKEN_PEPPER = process.env.REGISTRATION_ACCESS_TOKEN_PEPPER
const GENERIC_OTP_ERROR = 'The verification code is invalid or expired.'

// Fail closed if the registration-access feature is not configured.
router.use((_req, res, next) => {
  if (!OTP_PEPPER || !TOKEN_PEPPER) {
    return res.status(500).json({
      success: false,
      message: 'Registration access is not configured. Set REGISTRATION_ACCESS_OTP_PEPPER and REGISTRATION_ACCESS_TOKEN_PEPPER.',
    })
  }
  next()
})

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase()
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

/**
 * Fields selected for attendee responses. The attendee view (toAttendeeView) is
 * strictly whitelisted, so gender is selected only for the admin notification
 * email payload and is never returned to the attendee.
 */
const PUBLIC_FIELDS =
  'email gender fullName fee feeLabel sectionConference ' +
  'arrivalDate departureDate programPreference paymentOption status createdAt paymentScreenshot'

function toAttendeeView(reg) {
  const state = paymentState(reg)
  return {
    registrationId: reg._id,
    email: reg.email,
    fullName: reg.fullName,
    fee: reg.fee,
    feeLabel: reg.feeLabel,
    sectionConference: reg.sectionConference,
    arrivalDate: reg.arrivalDate,
    departureDate: reg.departureDate,
    programPreference: reg.programPreference,
    paymentOption: reg.paymentOption || 'pay_now',
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
    path: '/api/registration-access',
  })
}

/**
 * POST /api/registration-access/otp/request
 * Body: { email }
 * Always returns the same generic response so this endpoint cannot leak whether an
 * email is registered. An 8-digit OTP is emailed only when a registration exists.
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

  const otp = generateOtp(8)
  await RegistrationOtp.create({
    email,
    codeHash: hmacValue(otp, OTP_PEPPER),
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
 * Body: { email, code }
 * Validates a single-use 8-digit code (10-min expiry, max 5 attempts). All OTP
 * validity failures return the same generic response. On success, revokes any
 * existing attendee sessions for the email, creates a fresh 20-minute session,
 * and sets it as an HttpOnly cookie scoped to /api/registration-access.
 * Only { success, expiresAt } is returned — the token never leaves the cookie.
 */
router.post('/otp/verify', async (req, res) => {
  if (!isDBConnected()) {
    return res.status(503).json({ success: false, message: 'Service unavailable. Try again later.' })
  }

  const email = normalizeEmail(req.body?.email)
  const code = String(req.body?.code || '').trim()

  if (!isValidEmail(email) || !/^\d{8}$/.test(code)) {
    return res.status(400).json({ success: false, message: GENERIC_OTP_ERROR })
  }

  const verifyLimit = rateLimitHit(`otp:ver:${email}`, 5, 15 * 60 * 1000)
  if (!verifyLimit.ok) {
    return res.status(429).json({ success: false, message: 'Too many attempts. Please try again later.' })
  }

  const record = await RegistrationOtp.findOne({ email }).sort({ createdAt: -1 })
  if (!record || record.usedAt || record.expiresAt.getTime() <= Date.now()) {
    if (record && record.expiresAt.getTime() <= Date.now()) {
      await RegistrationOtp.deleteOne({ _id: record._id })
    }
    return res.status(400).json({ success: false, message: GENERIC_OTP_ERROR })
  }

  if (record.attemptCount >= OTP_MAX_ATTEMPTS) {
    return res.status(400).json({ success: false, message: GENERIC_OTP_ERROR })
  }

  if (!verifyHash(code, record.codeHash, OTP_PEPPER)) {
    await RegistrationOtp.updateOne({ _id: record._id }, { $inc: { attemptCount: 1 } })
    return res.status(400).json({ success: false, message: GENERIC_OTP_ERROR })
  }

  // Single-use: remove the code so it cannot be reused.
  await RegistrationOtp.deleteOne({ _id: record._id })

  // A new session supersedes any previous one for this email.
  await AttendeeSession.deleteMany({ email })

  const token = generateSessionToken()
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS)
  await AttendeeSession.create({ email, tokenHash: hmacValue(token, TOKEN_PEPPER), expiresAt })
  setSessionCookie(res, token, expiresAt)

  return res.json({ success: true, message: 'Verified successfully.', expiresAt })
})

/**
 * GET /api/registration-access/registrations
 * Requires an attendee session. Returns the attendee's registrations with derived
 * paymentState + canUploadPaymentProof, exposing only public fields.
 */
router.get('/registrations', requireAttendee, async (req, res) => {
  if (!isDBConnected()) {
    return res.status(503).json({ success: false, message: 'Service unavailable. Try again later.' })
  }

  const items = await Registration.find({ email: req.attendee.email })
    .sort({ createdAt: -1 })
    .select(PUBLIC_FIELDS)
    .lean()

  return res.json({ success: true, items: items.map(toAttendeeView) })
})

/**
 * POST /api/registration-access/registrations/:id/payment-proof
 * Requires an attendee session. Attach (or replace) payment proof for a registration
 * owned by the attendee, allowed only while its state is not_submitted or rejected.
 * On upload the registration becomes pay_now + pending and admin is notified.
 * The old screenshot is deleted only after the DB update succeeds.
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
      if (req.file?.path) fs.unlink(req.file.path, () => {})
      return res.status(404).json({ success: false, message: 'Registration not found.' })
    }

    const state = paymentState(reg)
    if (!canUploadPaymentProof(state)) {
      let message
      if (state === 'under_review') {
        message = { success: false, paymentState: 'under_review', message: 'Your payment proof is already under review.' }
      } else if (state === 'verified') {
        message = { success: false, paymentState: 'verified', message: 'Your payment has already been verified.' }
      } else {
        message = { success: false, paymentState: state, message: 'Payment proof cannot be changed at this time.' }
      }
      if (req.file?.path) fs.unlink(req.file.path, () => {})
      return res.status(409).json(message)
    }

    // Persist the new screenshot first; only delete the old one after success.
    const oldPath = reg.paymentScreenshot?.path

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

    if (oldPath && oldPath !== req.file.path && fs.existsSync(oldPath)) {
      fs.unlink(oldPath, () => {})
    }

    // Notify admin; a send failure must not undo the successful upload.
    try {
      await sendAdminRegistrationNotification({
        fullName: updated.fullName,
        gender: updated.gender,
        phone: '(hidden)', // attendee proof-upload path does not expose full contact fields
        email: updated.email,
        streetAddress: '',
        streetAddress2: '',
        city: '',
        state: '',
        postalCode: '',
        sectionConference: updated.sectionConference,
        occupation: '',
        fee: updated.fee,
        feeLabel: updated.feeLabel,
        paymentOption: 'pay_now',
        arrivalDate: updated.arrivalDate,
        departureDate: updated.departureDate,
        programPreference: updated.programPreference,
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