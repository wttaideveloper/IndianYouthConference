export const REGISTRATION_FEES = {

  standard: 1000,

  working: 1350,

  weekend: 500,

} as const



export const OCCUPATIONS = [

  'Student',

  'Pastor',

  'Missionary Volunteer',

  'Working',

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

  'Registration ₹1000 for Students, Pastors & Missionary Volunteers. ₹1350 for Working Professionals. Only over the Weekend ₹500'


