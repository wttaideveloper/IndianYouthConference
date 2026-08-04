import { Router } from 'express'
import fs from 'fs'
import path from 'path'
import Registration from '../models/Registration.js'
import { requireAdmin } from '../middleware/auth.js'
import { isDBConnected } from '../db.js'
import {
  validateRegistrationFields,
  buildRegistrationUpdate,
  calculateFee,
} from '../lib/registrationHelpers.js'
import { sendUserVerifiedEmail, sendUserRejectedEmail } from '../mailer.js'

const router = Router()

router.use(requireAdmin)

function buildFilter(query) {
  const filter = {}

  if (query.status) filter.status = query.status
  if (query.gender) filter.gender = query.gender
  if (query.occupation) filter.occupation = query.occupation
  if (query.programPreference) filter.programPreference = query.programPreference
  if (query.howDidYouKnow) filter.howDidYouKnow = query.howDidYouKnow
  if (query.pastAttendance) filter.pastAttendance = query.pastAttendance
  if (query.sectionConference?.trim()) {
    filter.sectionConference = { $regex: query.sectionConference.trim(), $options: 'i' }
  }

  if (query.search?.trim()) {
    const s = query.search.trim()
    filter.$or = [
      { fullName: { $regex: s, $options: 'i' } },
      { email: { $regex: s, $options: 'i' } },
      { phone: { $regex: s, $options: 'i' } },
      { sectionConference: { $regex: s, $options: 'i' } },
    ]
  }

  if (query.from || query.to) {
    filter.createdAt = {}
    if (query.from) filter.createdAt.$gte = new Date(query.from)
    if (query.to) {
      const to = new Date(query.to)
      to.setHours(23, 59, 59, 999)
      filter.createdAt.$lte = to
    }
  }

  return filter
}

function escapeCsv(value) {
  const str = value == null ? '' : String(value)
  if (/[",\n\r]/.test(str)) return `"${str.replace(/"/g, '""')}"`
  return str
}

function toCsvRow(values) {
  return values.map(escapeCsv).join(',')
}

const CSV_HEADERS = [
  'ID',
  'Submitted At',
  'Status',
  'Payment Option',
  'First Name',
  'Last Name',
  'Gender',
  'Phone',
  'Email',
  'Street Address',
  'Address Line 2',
  'City',
  'State',
  'Postal Code',
  'Section / Conference',
  'Occupation',
  'Fee',
  'Fee Label',
  'Arrival Date',
  'Departure Date',
  'Program Preference',
  'How Did You Know',
  'Attended Before',
  'Emergency Contact',
  'Emergency Number',
  'Admin Notes',
]

router.get('/stats', async (_req, res) => {
  if (!isDBConnected()) {
    return res.status(503).json({ success: false, message: 'Database not connected' })
  }

  const [total, pending, verified, rejected, byOccupation] = await Promise.all([
    Registration.countDocuments(),
    Registration.countDocuments({ status: 'pending' }),
    Registration.countDocuments({ status: 'verified' }),
    Registration.countDocuments({ status: 'rejected' }),
    Registration.aggregate([
      { $group: { _id: '$occupation', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
  ])

  res.json({
    success: true,
    stats: { total, pending, verified, rejected, byOccupation },
  })
})

router.get('/registrations', async (req, res) => {
  if (!isDBConnected()) {
    return res.status(503).json({ success: false, message: 'Database not connected' })
  }

  const page = Math.max(1, parseInt(req.query.page, 10) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20))
  const skip = (page - 1) * limit
  const filter = buildFilter(req.query)

  const [items, total] = await Promise.all([
    Registration.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-paymentScreenshot.path')
      .lean(),
    Registration.countDocuments(filter),
  ])

  res.json({
    success: true,
    items,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  })
})

router.get('/registrations/export', async (req, res) => {
  if (!isDBConnected()) {
    return res.status(503).json({ success: false, message: 'Database not connected' })
  }

  const filter = buildFilter(req.query)
  const items = await Registration.find(filter).sort({ createdAt: -1 }).lean()

  const lines = [toCsvRow(CSV_HEADERS)]
  for (const r of items) {
    lines.push(
      toCsvRow([
        r._id,
        r.createdAt ? new Date(r.createdAt).toISOString() : '',
        r.status,
        r.paymentOption || 'pay_now',
        r.firstName,
        r.lastName,
        r.gender,
        r.phone,
        r.email,
        r.streetAddress,
        r.streetAddress2,
        r.city,
        r.state,
        r.postalCode,
        r.sectionConference,
        r.occupation,
        r.fee,
        r.feeLabel,
        r.arrivalDate,
        r.departureDate,
        r.programPreference,
        r.howDidYouKnow,
        r.pastAttendance,
        r.emergencyContactName,
        r.emergencyContactNumber,
        r.adminNotes,
      ]),
    )
  }

  const filename = `iyc-registrations-${new Date().toISOString().slice(0, 10)}.csv`
  res.setHeader('Content-Type', 'text/csv; charset=utf-8')
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
  res.send('\uFEFF' + lines.join('\n'))
})

router.get('/registrations/:id', async (req, res) => {
  if (!isDBConnected()) {
    return res.status(503).json({ success: false, message: 'Database not connected' })
  }

  const item = await Registration.findById(req.params.id).lean()
  if (!item) {
    return res.status(404).json({ success: false, message: 'Registration not found' })
  }

  const { path: filePath, ...screenshotMeta } = item.paymentScreenshot || {}
  res.json({
    success: true,
    item: {
      ...item,
      paymentScreenshot: {
        ...screenshotMeta,
        hasFile: Boolean(filePath && fs.existsSync(filePath)),
      },
    },
  })
})

router.get('/registrations/:id/screenshot', async (req, res) => {
  if (!isDBConnected()) {
    return res.status(503).json({ success: false, message: 'Database not connected' })
  }

  const item = await Registration.findById(req.params.id)
  if (!item?.paymentScreenshot?.path) {
    return res.status(404).json({ success: false, message: 'Screenshot not found' })
  }

  const filePath = item.paymentScreenshot.path
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, message: 'Screenshot file missing on disk' })
  }

  res.setHeader('Content-Type', item.paymentScreenshot.mimetype || 'image/jpeg')
  res.setHeader(
    'Content-Disposition',
    `inline; filename="${item.paymentScreenshot.originalname || path.basename(filePath)}"`,
  )
  fs.createReadStream(filePath).pipe(res)
})

router.patch('/registrations/:id', async (req, res) => {
  if (!isDBConnected()) {
    return res.status(503).json({ success: false, message: 'Database not connected' })
  }

  const existing = await Registration.findById(req.params.id)
  if (!existing) {
    return res.status(404).json({ success: false, message: 'Registration not found' })
  }

  if (['verified', 'rejected'].includes(req.body.status)) {
    const hasScreenshot = Boolean(
      existing.paymentScreenshot?.path && fs.existsSync(existing.paymentScreenshot.path),
    )
    if (!hasScreenshot) {
      return res.status(400).json({
        success: false,
        errors: ['Cannot verify or reject — no payment screenshot exists for this registration.'],
      })
    }
  }

  const merged = {
    firstName: existing.firstName,
    lastName: existing.lastName,
    gender: existing.gender,
    phone: existing.phone,
    email: existing.email,
    streetAddress: existing.streetAddress,
    streetAddress2: existing.streetAddress2,
    city: existing.city,
    state: existing.state,
    postalCode: existing.postalCode,
    sectionConference: existing.sectionConference,
    occupation: existing.occupation,
    arrivalDate: existing.arrivalDate,
    departureDate: existing.departureDate,
    programPreference: existing.programPreference,
    howDidYouKnow: existing.howDidYouKnow,
    pastAttendance: existing.pastAttendance,
    emergencyContactName: existing.emergencyContactName,
    emergencyContactNumber: existing.emergencyContactNumber,
    status: existing.status,
    adminNotes: existing.adminNotes,
    ...req.body,
  }

  const errors = validateRegistrationFields(merged)
  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors })
  }

  const updates = buildRegistrationUpdate(req.body)
  if (updates.occupation || updates.programPreference) {
    const { fee, label } = calculateFee(
      updates.occupation || existing.occupation,
      updates.programPreference || existing.programPreference,
    )
    updates.fee = fee
    updates.feeLabel = label
  }

  const previousStatus = existing.status

  const item = await Registration.findByIdAndUpdate(
    req.params.id,
    { $set: updates },
    { new: true, runValidators: true },
  ).select('-paymentScreenshot.path')

  const emailWarnings = []

  if (updates.status === 'verified' && previousStatus !== 'verified' && !item.verificationEmailSent) {
    try {
      await sendUserVerifiedEmail(item.toObject())
      await Registration.findByIdAndUpdate(item._id, {
        verificationEmailSent: true,
        rejectionEmailSent: false,
      })
      item.verificationEmailSent = true
      item.rejectionEmailSent = false
    } catch (emailErr) {
      console.error('Verification email failed:', emailErr.message)
      emailWarnings.push('Registration updated, but verification email could not be sent.')
    }
  }

  if (updates.status === 'rejected' && previousStatus !== 'rejected' && !item.rejectionEmailSent) {
    try {
      await sendUserRejectedEmail(item.toObject())
      await Registration.findByIdAndUpdate(item._id, {
        rejectionEmailSent: true,
        verificationEmailSent: false,
      })
      item.rejectionEmailSent = true
      item.verificationEmailSent = false
    } catch (emailErr) {
      console.error('Rejection email failed:', emailErr.message)
      emailWarnings.push('Registration updated, but rejection email could not be sent.')
    }
  }

  res.json({
    success: true,
    item,
    ...(emailWarnings.length > 0 && { warning: emailWarnings.join(' ') }),
  })
})

router.delete('/registrations/:id', async (req, res) => {
  if (!isDBConnected()) {
    return res.status(503).json({ success: false, message: 'Database not connected' })
  }

  const item = await Registration.findById(req.params.id)
  if (!item) {
    return res.status(404).json({ success: false, message: 'Registration not found' })
  }

  const filePath = item.paymentScreenshot?.path
  await Registration.findByIdAndDelete(req.params.id)

  if (filePath && fs.existsSync(filePath)) {
    fs.unlink(filePath, () => {})
  }

  res.json({ success: true, message: 'Registration deleted' })
})

export default router
