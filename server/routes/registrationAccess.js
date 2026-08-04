import { Router } from 'express'
import multer from 'multer'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import Registration from '../models/Registration.js'
import RegistrationOtp from '../models/RegistrationOtp.js'
import AttendeeSession from '../models/AttendeeSession.js'
import { isDBConnected } from '../db.js'
import { requireAttendee, setAttendeeSessionCookie } from '../middleware/attendeeAuth.js'
import {
  generateOtp,
  generatePaymentProofFilename,
  generatePaymentProofTemporaryFilename,
  generateSessionToken,
  hmacValue,
  verifyHash,
} from '../lib/crypto.js'
import { paymentState, canUploadPaymentProof } from '../lib/paymentState.js'
import { enforceCooldown, hitRateLimit } from '../lib/rateLimit.js'
import { sendOtpEmail, sendAdminPaymentProofNotification } from '../mailer.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const uploadsDir = path.join(__dirname, '..', 'uploads')
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, _file, cb) => {
    try {
      cb(null, generatePaymentProofTemporaryFilename())
    } catch (err) {
      cb(err)
    }
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
const OTP_RATE_WINDOW_MS = 60 * 60 * 1000
const OTP_RESEND_COOLDOWN_MS = 60 * 1000
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

function normalizeIp(value) {
  const ip = String(value || '').trim().toLowerCase()
  return ip.startsWith('::ffff:') ? ip.slice(7) : ip || 'unknown'
}

async function removeUploadedFile(file) {
  if (!file?.path) return

  try {
    await fs.promises.unlink(file.path)
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error('Failed to remove uploaded payment proof:', err.message)
    }
  }
}

function detectPaymentProofImageType(buffer, bytesRead) {
  if (bytesRead >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'jpeg'
  if (
    bytesRead >= 8 &&
    buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47 &&
    buffer[4] === 0x0d && buffer[5] === 0x0a && buffer[6] === 0x1a && buffer[7] === 0x0a
  ) return 'png'
  if (
    bytesRead >= 12 &&
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  ) return 'webp'
  return null
}

async function validateAndFinalizePaymentProof(file) {
  let handle
  try {
    handle = await fs.promises.open(file.path, 'r')
    const buffer = Buffer.alloc(12)
    const { bytesRead } = await handle.read(buffer, 0, buffer.length, 0)
    const imageType = detectPaymentProofImageType(buffer, bytesRead)
    if (!imageType) throw new Error('Payment proof has an invalid image signature')

    const filename = generatePaymentProofFilename(imageType)
    const finalPath = path.join(uploadsDir, filename)
    await fs.promises.rename(file.path, finalPath)

    file.path = finalPath
    file.filename = filename
    file.mimetype = imageType === 'jpeg' ? 'image/jpeg' : `image/${imageType}`
    return file
  } finally {
    if (handle) await handle.close()
  }
}

function handlePaymentProofUpload(req, res, next) {
  upload.single('paymentScreenshot')(req, res, async (err) => {
    if (!err) return next()

    await removeUploadedFile(req.file)
    console.error('Payment proof upload rejected:', err.message)
    return res.status(400).json({ success: false, message: 'Invalid payment screenshot.' })
  })
}

/**
 * Fields selected for attendee responses. The view is strictly whitelisted;
 * paymentScreenshot is selected only to derive paymentState and is never returned.
 */
const PUBLIC_FIELDS =
  'email fullName fee feeLabel paymentOption status createdAt paymentScreenshot'

function toAttendeeView(reg) {
  const state = paymentState(reg)
  return {
    registrationId: String(reg._id),
    email: reg.email,
    fullName: reg.fullName,
    fee: reg.fee,
    feeLabel: reg.feeLabel,
    paymentOption: reg.paymentOption || 'pay_now',
    status: reg.status,
    createdAt: reg.createdAt,
    paymentState: state,
    canUploadPaymentProof: canUploadPaymentProof(state),
  }
}

/**
 * POST /api/registration-access/otp/request
 * Body: { email }
 * Always returns the same generic response so this endpoint cannot leak whether an
 * email is registered. An 8-digit OTP is emailed only when a registration exists.
 */
router.post('/otp/request', async (req, res) => {
  const email = normalizeEmail(req.body?.email)
  const generic = {
    success: true,
    message: 'If an active registration exists for this email, we have sent you a verification code.',
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ success: false, message: 'A valid email address is required.' })
  }

  const ip = normalizeIp(req.ip)

  try {
    if (!isDBConnected()) {
      console.error('OTP request skipped: database is unavailable')
      return res.status(202).json(generic)
    }

    const ipLimit = await hitRateLimit({
      scope: 'otp_request_ip',
      key: ip,
      limit: 20,
      windowMs: OTP_RATE_WINDOW_MS,
      pepper: OTP_PEPPER,
    })
    if (!ipLimit.allowed) {
      return res.status(429).json({ success: false, message: 'Too many requests. Please try again later.' })
    }

    const emailLimit = await hitRateLimit({
      scope: 'otp_request_email',
      key: email,
      limit: 5,
      windowMs: OTP_RATE_WINDOW_MS,
      pepper: OTP_PEPPER,
    })
    if (!emailLimit.allowed) {
      return res.status(429).json({ success: false, message: 'Too many requests. Please try again later.' })
    }

    const resendCooldown = await enforceCooldown({
      scope: 'otp_resend_email',
      key: email,
      cooldownMs: OTP_RESEND_COOLDOWN_MS,
      pepper: OTP_PEPPER,
    })
    if (!resendCooldown.allowed) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.',
      })
    }

    const reg = await Registration.findOne({ email }).select('email fullName fee paymentOption').lean()
    if (!reg) {
      return res.status(202).json(generic)
    }

    // Only one active code per email at a time.
    await RegistrationOtp.deleteMany({ email, usedAt: null })

    const otp = generateOtp(8)
    const challenge = await RegistrationOtp.create({
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
      try {
        await RegistrationOtp.deleteOne({ _id: challenge._id })
      } catch (cleanupErr) {
        console.error('Failed to invalidate undelivered OTP:', cleanupErr.message)
      }

      console.error('OTP email failed:', err.message)
    }

    return res.status(202).json(generic)
  } catch (err) {
    console.error('OTP request failed:', err.message)
    return res.status(202).json(generic)
  }
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

  try {
    const ip = normalizeIp(req.ip)
    const ipLimit = await hitRateLimit({
      scope: 'otp_verify_ip',
      key: ip,
      limit: 40,
      windowMs: OTP_RATE_WINDOW_MS,
      pepper: OTP_PEPPER,
    })
    if (!ipLimit.allowed) {
      return res.status(429).json({ success: false, message: 'Too many requests. Please try again later.' })
    }

    const emailLimit = await hitRateLimit({
      scope: 'otp_verify_email',
      key: email,
      limit: 20,
      windowMs: OTP_RATE_WINDOW_MS,
      pepper: OTP_PEPPER,
    })
    if (!emailLimit.allowed) {
      return res.status(429).json({ success: false, message: 'Too many requests. Please try again later.' })
    }

    const record = await RegistrationOtp.findOne({ email }).sort({ createdAt: -1 })
    if (!record || record.usedAt || record.expiresAt.getTime() <= Date.now()) {
      if (record && record.expiresAt.getTime() <= Date.now()) {
        try {
          await RegistrationOtp.deleteOne({ _id: record._id })
        } catch (cleanupErr) {
          console.error('Failed to remove expired OTP:', cleanupErr.message)
        }
      }
      return res.status(400).json({ success: false, message: GENERIC_OTP_ERROR })
    }

    if (record.attemptCount >= OTP_MAX_ATTEMPTS) {
      return res.status(400).json({ success: false, message: GENERIC_OTP_ERROR })
    }

    if (!verifyHash(code, record.codeHash, OTP_PEPPER)) {
      await RegistrationOtp.updateOne(
        {
          _id: record._id,
          email,
          usedAt: null,
          expiresAt: { $gt: new Date() },
          attemptCount: { $lt: OTP_MAX_ATTEMPTS },
        },
        { $inc: { attemptCount: 1 } },
      )
      return res.status(400).json({ success: false, message: GENERIC_OTP_ERROR })
    }

    const consumed = await RegistrationOtp.findOneAndDelete({
      _id: record._id,
      email,
      codeHash: hmacValue(code, OTP_PEPPER),
      expiresAt: { $gt: new Date() },
      usedAt: null,
      attemptCount: { $lt: OTP_MAX_ATTEMPTS },
    })

    if (!consumed) {
      return res.status(400).json({ success: false, message: GENERIC_OTP_ERROR })
    }

    // A new session supersedes any previous one for this email.
    await AttendeeSession.deleteMany({ email })

    const token = generateSessionToken()
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS)
    await AttendeeSession.create({ email, tokenHash: hmacValue(token, TOKEN_PEPPER), expiresAt })
    setAttendeeSessionCookie(res, token)

    return res.json({ success: true, message: 'Verified successfully.', expiresAt })
  } catch (err) {
    console.error('OTP verification failed:', err.message)
    return res.status(500).json({ success: false, message: 'Failed to verify registration. Please request a new code.' })
  }
})

/**
 * GET /api/registration-access/registrations
 * Requires an attendee session. Returns the attendee's registrations with derived
 * paymentState + canUploadPaymentProof, exposing only public fields.
 */
router.get('/registrations', requireAttendee, async (req, res) => {
  try {
    if (!isDBConnected()) {
      return res.status(503).json({ success: false, message: 'Service unavailable. Try again later.' })
    }

    const items = await Registration.find({ email: req.attendee.email })
      .sort({ createdAt: -1 })
      .select(PUBLIC_FIELDS)
      .lean()

    return res.json({ success: true, items: items.map(toAttendeeView) })
  } catch (err) {
    console.error('Attendee registration lookup failed:', err.message)
    return res.status(500).json({ success: false, message: 'Failed to load registrations. Please try again.' })
  }
})

/**
 * POST /api/registration-access/registrations/:id/payment-proof
 * Requires an attendee session. Attach (or replace) payment proof for a registration
 * owned by the attendee, allowed only while its state is not_submitted or rejected.
 * On upload the registration becomes pay_now + pending and admin is notified.
 * The old screenshot is deleted only after the DB update succeeds.
 */
router.post('/registrations/:id/payment-proof', requireAttendee, handlePaymentProofUpload, async (req, res) => {
  let uploadPersisted = false

  try {
    if (!isDBConnected()) {
      await removeUploadedFile(req.file)
      return res.status(503).json({ success: false, message: 'Service unavailable. Try again later.' })
    }

    if (!req.file) {
      return res.status(400).json({ success: false, errors: ['Payment screenshot is required.'] })
    }

    try {
      await validateAndFinalizePaymentProof(req.file)
    } catch (validationErr) {
      await removeUploadedFile(req.file)
      console.error('Payment proof validation failed:', validationErr.message)
      return res.status(400).json({ success: false, message: 'Invalid payment screenshot.' })
    }

    const reg = await Registration.findOne({ _id: req.params.id, email: req.attendee.email })
    if (!reg) {
      await removeUploadedFile(req.file)
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
      await removeUploadedFile(req.file)
      return res.status(409).json(message)
    }

    // Persist the new screenshot first; only delete the old one after success.
    const oldPath = reg.paymentScreenshot?.path

    const updated = await Registration.findOneAndUpdate(
      {
        _id: reg._id,
        email: req.attendee.email,
        $or: [
          { status: 'rejected' },
          {
            status: 'pending',
            'paymentScreenshot.filename': { $in: [null, ''] },
            'paymentScreenshot.path': { $in: [null, ''] },
          },
        ],
      },
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

    if (!updated) {
      await removeUploadedFile(req.file)

      const latest = await Registration.findOne({ _id: req.params.id, email: req.attendee.email })
        .select('status paymentScreenshot')
        .lean()

      if (!latest) {
        return res.status(404).json({ success: false, message: 'Registration not found.' })
      }

      const latestState = paymentState(latest)
      if (latestState === 'verified') {
        return res.status(409).json({
          success: false,
          paymentState: 'verified',
          message: 'Your payment has already been verified.',
        })
      }
      if (latestState === 'under_review') {
        return res.status(409).json({
          success: false,
          paymentState: 'under_review',
          message: 'Your payment proof is already under review.',
        })
      }
      return res.status(409).json({
        success: false,
        paymentState: latestState,
        message: 'Payment proof can no longer be changed. Please refresh and try again.',
      })
    }

    uploadPersisted = true

    if (oldPath && oldPath !== req.file.path && fs.existsSync(oldPath)) {
      await removeUploadedFile({ path: oldPath })
    }

    // Notify admin; a send failure must not undo the successful upload.
    let notificationWarning
    try {
      await sendAdminPaymentProofNotification({
        registrationId: String(updated._id),
        fullName: updated.fullName,
        email: updated.email,
        previousPaymentState: state,
        paymentScreenshot: updated.paymentScreenshot,
      })
    } catch (emailErr) {
      console.error('Proof-upload admin notification failed (upload saved):', emailErr.message)
      notificationWarning = 'Payment proof was saved, but the admin notification could not be sent.'
    }

    const response = {
      success: true,
      message: 'Payment proof submitted for review.',
      item: toAttendeeView(updated),
    }
    if (notificationWarning) response.warning = notificationWarning
    return res.json(response)
  } catch (err) {
    if (!uploadPersisted) await removeUploadedFile(req.file)
    console.error('Payment proof upload error:', err.message)
    return res.status(500).json({ success: false, message: 'Failed to submit payment proof. Please try again.' })
  }
})

export default router
