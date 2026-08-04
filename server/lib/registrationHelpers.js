export const OCCUPATIONS = ['Student', 'Pastor', 'Missionary Volunteer', 'Working', 'Dependent']
export const GENDERS = ['Male', 'Female']
export const HOW_DID_YOU_KNOW = ['Facebook', 'WhatsApp', 'Instagram', 'Other']
export const PAST_ATTENDANCE = ['Yes', 'No']
export const PROGRAM_PREFERENCES = ['All the Days', 'Only Over the Weekend']
export const STATUSES = ['pending', 'verified', 'rejected']

const STANDARD_LABELS = {
  Student: 'Student',
  Pastor: 'Pastor',
  'Missionary Volunteer': 'Missionary Volunteer',
  Dependent: 'Dependent',
}

export function calculateFee(occupation, programPreference) {
  if (programPreference === 'Only Over the Weekend') return { fee: 500, label: 'Weekend Only' }
  if (occupation === 'Working') return { fee: 1350, label: 'Working Professional' }
  return {
    fee: 1000,
    label: STANDARD_LABELS[occupation] || 'Student / Pastor / Missionary Volunteer',
  }
}

export function validateRegistrationFields(body, { partial = false } = {}) {
  const errors = []
  const req = (field, msg) => {
    if (partial && body[field] === undefined) return
    if (!body[field]?.toString().trim()) errors.push(msg)
  }

  req('firstName', 'First name is required')
  req('lastName', 'Last name is required')
  if (body.gender !== undefined && !GENDERS.includes(body.gender)) {
    errors.push('Please select a valid gender')
  }
  if (body.phone !== undefined) {
    if (!body.phone?.trim() || !/^[\d\s+\-()]{10,15}$/.test(body.phone)) {
      errors.push('A valid phone number is required')
    }
  }
  if (body.email !== undefined) {
    if (!body.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      errors.push('A valid email is required')
    }
  }
  req('streetAddress', 'Street address is required')
  req('city', 'City is required')
  req('state', 'State is required')
  req('postalCode', 'Postal / zip code is required')
  req('sectionConference', 'Section / Conference is required')
  if (body.occupation !== undefined && !OCCUPATIONS.includes(body.occupation)) {
    errors.push('Please select a valid occupation')
  }
  req('arrivalDate', 'Expected date of arrival is required')
  req('departureDate', 'Expected date of departure is required')
  if (body.programPreference !== undefined && body.programPreference && !PROGRAM_PREFERENCES.includes(body.programPreference)) {
    errors.push('Invalid program preference')
  }
  if (body.howDidYouKnow !== undefined && !HOW_DID_YOU_KNOW.includes(body.howDidYouKnow)) {
    errors.push('Please select how you heard about IYC')
  }
  if (body.pastAttendance !== undefined && !PAST_ATTENDANCE.includes(body.pastAttendance)) {
    errors.push('Please indicate if you attended IYC before')
  }
  req('emergencyContactName', 'Emergency contact name is required')
  req('emergencyContactNumber', 'Emergency contact number is required')
  if (body.status !== undefined && !STATUSES.includes(body.status)) {
    errors.push('Invalid status')
  }
  if (body.paymentOption !== undefined && !['pay_now', 'pay_later'].includes(body.paymentOption)) {
    errors.push('Invalid payment option')
  }

  return errors
}

export function buildRegistrationUpdate(body) {
  const updates = {}

  const stringFields = [
    'firstName', 'lastName', 'gender', 'phone', 'email',
    'streetAddress', 'streetAddress2', 'city', 'state', 'postalCode',
    'sectionConference', 'occupation', 'arrivalDate', 'departureDate',
    'programPreference', 'howDidYouKnow', 'pastAttendance',
    'emergencyContactName', 'emergencyContactNumber', 'status', 'paymentOption', 'adminNotes',
  ]

  for (const field of stringFields) {
    if (body[field] !== undefined) {
      updates[field] = typeof body[field] === 'string' ? body[field].trim() : body[field]
    }
  }

  if (updates.email) updates.email = updates.email.toLowerCase()
  if (updates.firstName || updates.lastName) {
    const first = updates.firstName
    const last = updates.lastName
    if (first && last) updates.fullName = `${first} ${last}`
  }

  if (updates.occupation || updates.programPreference) {
    const occupation = updates.occupation
    const programPreference = updates.programPreference || 'All the Days'
    if (occupation) {
      const { fee, label } = calculateFee(occupation, programPreference)
      updates.fee = fee
      updates.feeLabel = label
    }
  }

  return updates
}
