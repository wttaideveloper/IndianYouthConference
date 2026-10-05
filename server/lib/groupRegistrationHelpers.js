import { isValidRegistrationPhoneNumber } from './countryPhoneValidation.js'
import {
  OCCUPATIONS,
  GENDERS,
  PROGRAM_PREFERENCES,
  calculateFee,
} from './registrationHelpers.js'

/** Validate attendee rows and recalculate their fees on the server. */
export function normalizeGroupAttendees(value) {
  if (!Array.isArray(value)) return { errors: ['Group attendees must be a list.'], attendees: [] }
  if (value.length > 24) {
    return {
      errors: ['A group can include up to 25 attendees, including the organizer.'],
      attendees: [],
    }
  }

  const errors = []
  const attendees = value.map((person, index) => {
    const label = `Attendee ${index + 2}`
    if (!person || typeof person !== 'object') {
      errors.push(`${label}: details are invalid`)
      return null
    }

    const firstName = String(person.firstName || '').trim()
    const lastName = String(person.lastName || '').trim()
    const phone = String(person.phone || '').trim()
    const occupation = String(person.occupation || '')
    const programPreference = String(person.programPreference || 'All the Days')
    const emergencyContactName = String(person.emergencyContactName || '').trim()
    const emergencyContactNumber = String(person.emergencyContactNumber || '').trim()
    const ageRaw = String(person.age || '').trim()

    if (!firstName) errors.push(`${label}: first name is required`)
    if (!lastName) errors.push(`${label}: last name is required`)
    if (!GENDERS.includes(person.gender)) errors.push(`${label}: select a valid gender`)
    if (!isValidRegistrationPhoneNumber(phone)) errors.push(`${label}: a valid phone number is required`)
    if (!OCCUPATIONS.includes(occupation)) errors.push(`${label}: select a valid occupation`)
    if (!PROGRAM_PREFERENCES.includes(programPreference)) errors.push(`${label}: select a valid program`)
    if (!emergencyContactName) errors.push(`${label}: emergency contact name is required`)
    if (!isValidRegistrationPhoneNumber(emergencyContactNumber)) errors.push(`${label}: a valid emergency contact number is required`)
    const age = Number(ageRaw)
    if (!ageRaw || !Number.isFinite(age) || age < 1 || age > 120 || !/^\d{1,3}$/.test(ageRaw)) {
      errors.push(`${label}: age must be a number between 1 and 120 (max 3 digits)`)
    }

    const feeInfo = calculateFee(occupation, programPreference)
    return {
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`.trim(),
      gender: person.gender,
      phone,
      occupation,
      programPreference,
      fee: feeInfo.fee,
      feeLabel: feeInfo.label,
      emergencyContactName,
      emergencyContactNumber,
      age: Math.trunc(age),
    }
  })

  return { errors, attendees }
}
