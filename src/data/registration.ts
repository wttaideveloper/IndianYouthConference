export const REGISTRATION_FEES = {

  standard: 1000,

  working: 1350,

  weekend: 500,

} as const



export const PAYMENT_OPTIONS = ['pay_now', 'pay_later'] as const

export type PaymentOption = (typeof PAYMENT_OPTIONS)[number]



export const OCCUPATIONS = [

  'Student',

  'Pastor',

  'Missionary Volunteer',

  'Working',
  'Dependent',

] as const



export const GENDERS = ['Male', 'Female'] as const

export const PROGRAM_PREFERENCES = ['All the Days', 'Only Over the Weekend'] as const

export const HOW_DID_YOU_KNOW = ['Facebook', 'WhatsApp', 'Instagram', 'Other'] as const

export const PAST_ATTENDANCE = ['Yes', 'No'] as const



const STANDARD_LABELS: Record<string, string> = {

  Student: 'Student',

  Pastor: 'Pastor',

  'Missionary Volunteer': 'Missionary Volunteer',

  Dependent: 'Dependent',

}



export function calculateFee(

  occupation: string,

  programPreference: string,

): { fee: number; label: string } {

  if (programPreference === 'Only Over the Weekend') {

    return { fee: REGISTRATION_FEES.weekend, label: 'Weekend Only' }

  }

  if (occupation === 'Working') {

    return { fee: REGISTRATION_FEES.working, label: 'Working Professional' }

  }

  return {

    fee: REGISTRATION_FEES.standard,

    label: STANDARD_LABELS[occupation] || 'Student / Pastor / Missionary Volunteer',

  }

}



export const PAYMENT_NOTE =
  'Registration Rs.1000 for Students, Pastors & Missionary Volunteers. Rs.1350 for Working Professionals. Only over the Weekend Rs.500'

export const MIN_AGE = 1
export const MAX_AGE = 120

export interface FormData {
  firstName: string
  lastName: string
  gender: string
  phone: string
  email: string
  age: string
  streetAddress: string
  streetAddress2: string
  city: string
  state: string
  postalCode: string
  sectionConference: string
  occupation: string
  arrivalDate: string
  departureDate: string
  programPreference: string
  howDidYouKnow: string
  pastAttendance: string
  emergencyContactName: string
  emergencyContactNumber: string
}
