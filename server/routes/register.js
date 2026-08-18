import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import {
  sendAdminRegistrationNotification,
  sendCompletePaymentEmail,
  sendPaymentReceivedEmail,
  sendRegistrationConfirmationEmail,
} from '../mailer.js'
import Registration from '../models/Registration.js'
import { isDBConnected } from '../db.js'
import { isValidRegistrationPhoneNumber } from '../lib/countryPhoneValidation.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const uploadsDir = path.join(__dirname, '..', 'uploads')

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

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

const OCCUPATIONS = ['Student', 'Pastor', 'Missionary Volunteer', 'Working', 'Dependent']
const GENDERS = ['Male', 'Female']
const HOW_DID_YOU_KNOW = ['Facebook', 'WhatsApp', 'Instagram', 'Other']
const PAST_ATTENDANCE = ['Yes', 'No']
const PROGRAM_PREFERENCES = ['All the Days', 'Only Over the Weekend', '']

const STANDARD_LABELS = {
  Student: 'Student',
  Pastor: 'Pastor',
  'Missionary Volunteer': 'Missionary Volunteer',
  Dependent: 'Dependent',
}

function calculateFee(occupation, programPreference) {
  if (programPreference === 'Only Over the Weekend') return { fee: 500, label: 'Weekend Only' }
  if (occupation === 'Working') return { fee: 1350, label: 'Working Professional' }
  return {
    fee: 1000,
    label: STANDARD_LABELS[occupation] || 'Student / Pastor / Missionary Volunteer',
  }
}

async function removeUploadedFile(file) {
  if (!file?.path) return

  try {
    await fs.promises.unlink(file.path)
  } catch (err) {
    if (err.code !== 'ENOENT') console.error('Failed to remove uploaded payment proof:', err.message)
  }
}

function validateBody(body) {
  const errors = []
  if (!['pay_now', 'pay_later'].includes(body.paymentOption)) errors.push('Please choose a payment option')
  if (!body.firstName?.trim()) errors.push('First name is required')
  if (!body.lastName?.trim()) errors.push('Last name is required')
  if (!GENDERS.includes(body.gender)) errors.push('Please select a valid gender')
  if (!isValidRegistrationPhoneNumber(body.phone)) {
    errors.push('A valid phone number is required')
  }
  if (!body.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    errors.push('A valid email is required')
  }
  if (!body.streetAddress?.trim()) errors.push('Street address is required')
  if (!body.city?.trim()) errors.push('City is required')
  if (!body.state?.trim()) errors.push('State is required')
  if (!body.postalCode?.trim()) errors.push('Postal / zip code is required')
  if (!body.sectionConference?.trim()) errors.push('Section / Conference is required')
  if (!OCCUPATIONS.includes(body.occupation)) errors.push('Please select a valid occupation')
  if (!body.arrivalDate) errors.push('Expected date of arrival is required')
  if (!body.departureDate) errors.push('Expected date of departure is required')
  const MIN_DATE = '2026-10-13'
  const MAX_DATE = '2026-10-21'
  if (body.arrivalDate && (body.arrivalDate < MIN_DATE || body.arrivalDate > MAX_DATE)) {
    errors.push('Arrival date must be between Oct 13 and Oct 21, 2026')
  }
  if (body.departureDate && (body.departureDate < MIN_DATE || body.departureDate > MAX_DATE)) {
    errors.push('Departure date must be between Oct 13 and Oct 21, 2026')
  }
  if (body.arrivalDate && body.departureDate && body.departureDate < body.arrivalDate) {
    errors.push('Departure date cannot be before the arrival date')
  }
  if (body.programPreference && !PROGRAM_PREFERENCES.includes(body.programPreference)) {
    errors.push('Invalid program preference')
  }
  if (!HOW_DID_YOU_KNOW.includes(body.howDidYouKnow)) {
    errors.push('Please select how you heard about IYC')
  }
  if (!PAST_ATTENDANCE.includes(body.pastAttendance)) {
    errors.push('Please indicate if you attended IYC before')
  }
  if (!body.emergencyContactName?.trim()) errors.push('Emergency contact name is required')
  if (!isValidRegistrationPhoneNumber(body.emergencyContactNumber)) {
    errors.push('A valid emergency contact number is required')
  }

  return errors
}

router.post('/', upload.single('paymentScreenshot'), async (req, res) => {
  try {
    const registrationBody = {
      ...req.body,
      paymentOption: req.body.paymentOption || 'pay_now',
    }
    const paymentOption = registrationBody.paymentOption

    if (paymentOption === 'pay_now' && !req.file) {
      return res.status(400).json({
        success: false,
        errors: ['Payment screenshot is required. Please attach your payment proof.'],
      })
    }
    if (paymentOption === 'pay_later' && req.file) {
      fs.unlink(req.file.path, () => {})
      return res.status(400).json({
        success: false,
        errors: ['Pay Later does not require a payment screenshot. Please clear it and resubmit.'],
      })
    }

    const errors = validateBody(registrationBody)
    if (errors.length > 0) {
      await removeUploadedFile(req.file)
      return res.status(400).json({ success: false, errors })
    }

    const email = registrationBody.email.trim().toLowerCase()

    if (!isDBConnected()) {
      await removeUploadedFile(req.file)
      return res.status(503).json({
        success: false,
        message: 'Registration service unavailable. Database is not connected.',
      })
    }

    const existingRegistration = await Registration.exists({ email })
    if (existingRegistration) {
      await removeUploadedFile(req.file)
      return res.status(409).json({
        success: false,
        code: 'REGISTRATION_EMAIL_EXISTS',
        message: 'A registration with this email already exists.',
      })
    }

    const { fee, label: feeLabel } = calculateFee(
      registrationBody.occupation,
      registrationBody.programPreference || '',
    )

    const data = {
      firstName: registrationBody.firstName.trim(),
      lastName: registrationBody.lastName.trim(),
      fullName: `${registrationBody.firstName.trim()} ${registrationBody.lastName.trim()}`,
      gender: registrationBody.gender,
      phone: registrationBody.phone.trim(),
      email,
      streetAddress: registrationBody.streetAddress.trim(),
      streetAddress2: registrationBody.streetAddress2?.trim() || '',
      city: registrationBody.city.trim(),
      state: registrationBody.state.trim(),
      postalCode: registrationBody.postalCode.trim(),
      sectionConference: registrationBody.sectionConference.trim(),
      occupation: registrationBody.occupation,
      arrivalDate: registrationBody.arrivalDate,
      departureDate: registrationBody.departureDate,
      programPreference: registrationBody.programPreference || 'All the Days',
      howDidYouKnow: registrationBody.howDidYouKnow,
      pastAttendance: registrationBody.pastAttendance,
      emergencyContactName: registrationBody.emergencyContactName.trim(),
      emergencyContactNumber: registrationBody.emergencyContactNumber.trim(),
      fee,
      feeLabel,
      paymentOption,
      ...(req.file
        ? {
            paymentScreenshot: {
              path: req.file.path,
              filename: req.file.filename,
              originalname: req.file.originalname,
              mimetype: req.file.mimetype,
            },
          }
        : {}),
    }

    const saved = await Registration.create(data)

    let emailSent = false
    try {
      await sendAdminRegistrationNotification(data)
      emailSent = true
      await Registration.findByIdAndUpdate(saved._id, { emailSent: true })
    } catch (emailErr) {
      console.error('Admin notification email failed (registration saved):', emailErr.message)
    }

    try {
      await sendRegistrationConfirmationEmail(data)
    } catch (emailErr) {
      console.error('Attendee registration confirmation email failed (registration saved):', emailErr.message)
    }

    try {
      if (paymentOption === 'pay_later') await sendCompletePaymentEmail(data)
      else await sendPaymentReceivedEmail(data)
    } catch (emailErr) {
      console.error('Attendee payment-status email failed (registration saved):', emailErr.message)
    }

    const successMessage =
      paymentOption === 'pay_later'
        ? 'Registration submitted successfully. Please complete your payment before the event. You can return to this website anytime and use ‘Already Registered’ on the Home page to continue your payment and submit your payment proof.'
        : emailSent
          ? 'Registration submitted successfully. You will receive a confirmation email once your payment is verified by our team.'
          : 'Registration submitted successfully. Our team will review your payment and contact you shortly.'

    res.json({ success: true, message: successMessage, id: saved._id })
  } catch (err) {
    await removeUploadedFile(req.file)
    if (err?.code === 11000) {
      return res.status(409).json({
        success: false,
        code: 'REGISTRATION_EMAIL_EXISTS',
        message: 'A registration with this email already exists.',
      })
    }
    console.error('Registration error:', err.message)
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to submit registration. Please try again later.',
    })
  }
})

export default router
