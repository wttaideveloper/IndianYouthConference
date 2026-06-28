import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { sendRegistrationEmails } from '../mailer.js'
import Registration from '../models/Registration.js'
import { isDBConnected } from '../db.js'

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

function validateBody(body) {
  const errors = []

  if (!body.firstName?.trim()) errors.push('First name is required')
  if (!body.lastName?.trim()) errors.push('Last name is required')
  if (!GENDERS.includes(body.gender)) errors.push('Please select a valid gender')
  if (!body.phone?.trim() || !/^[\d\s+\-()]{10,15}$/.test(body.phone)) {
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
  if (!body.emergencyContactNumber?.trim()) errors.push('Emergency contact number is required')

  return errors
}

router.post('/', upload.single('paymentScreenshot'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        errors: ['Payment screenshot is required. Please attach your payment proof.'],
      })
    }

    const errors = validateBody(req.body)
    if (errors.length > 0) {
      fs.unlink(req.file.path, () => {})
      return res.status(400).json({ success: false, errors })
    }

    const { fee, label: feeLabel } = calculateFee(
      req.body.occupation,
      req.body.programPreference || '',
    )

    const data = {
      firstName: req.body.firstName.trim(),
      lastName: req.body.lastName.trim(),
      fullName: `${req.body.firstName.trim()} ${req.body.lastName.trim()}`,
      gender: req.body.gender,
      phone: req.body.phone.trim(),
      email: req.body.email.trim().toLowerCase(),
      streetAddress: req.body.streetAddress.trim(),
      streetAddress2: req.body.streetAddress2?.trim() || '',
      city: req.body.city.trim(),
      state: req.body.state.trim(),
      postalCode: req.body.postalCode.trim(),
      sectionConference: req.body.sectionConference.trim(),
      occupation: req.body.occupation,
      arrivalDate: req.body.arrivalDate,
      departureDate: req.body.departureDate,
      programPreference: req.body.programPreference || 'All the Days',
      howDidYouKnow: req.body.howDidYouKnow,
      pastAttendance: req.body.pastAttendance,
      emergencyContactName: req.body.emergencyContactName.trim(),
      emergencyContactNumber: req.body.emergencyContactNumber.trim(),
      fee,
      feeLabel,
      paymentScreenshot: {
        path: req.file.path,
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
      },
    }

    if (!isDBConnected()) {
      fs.unlink(req.file.path, () => {})
      return res.status(503).json({
        success: false,
        message: 'Registration service unavailable. Database is not connected.',
      })
    }

    const saved = await Registration.create({
      ...data,
      paymentScreenshot: {
        filename: data.paymentScreenshot.filename,
        originalname: data.paymentScreenshot.originalname,
        mimetype: data.paymentScreenshot.mimetype,
        path: data.paymentScreenshot.path,
      },
    })

    let emailSent = false
    try {
      await sendRegistrationEmails(data)
      emailSent = true
      await Registration.findByIdAndUpdate(saved._id, { emailSent: true })
    } catch (emailErr) {
      console.error('Email error (registration saved):', emailErr.message)
    }

    res.json({
      success: true,
      message: emailSent
        ? 'Registration submitted successfully. A confirmation email has been sent.'
        : 'Registration submitted successfully. We will contact you shortly.',
      id: saved._id,
    })
  } catch (err) {
    if (req.file?.path) fs.unlink(req.file.path, () => {})
    console.error('Registration error:', err.message)
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to submit registration. Please try again later.',
    })
  }
})

export default router
