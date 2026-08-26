import { useMemo, useRef, useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import Button from './Button'
import PaymentSection from './PaymentSection'
import PhoneNumberField from './PhoneNumberField'
import { EVENT } from '../data/content'
import {
  OCCUPATIONS,
  GENDERS,
  PROGRAM_PREFERENCES,
  HOW_DID_YOU_KNOW,
  PAST_ATTENDANCE,
  calculateFee,
} from '../data/registration'
import {
  DEFAULT_COUNTRY_CALLING_CODE,
  getCountryCallingCodeOption,
  isValidNationalPhoneNumber,
  nationalPhoneNumberLengthError,
  splitInternationalPhone,
  toInternationalPhone,
} from '../data/countryCallingCodes'

interface FormData {
  firstName: string
  lastName: string
  gender: string
  email: string
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
}

const INITIAL: FormData = {
  firstName: '',
  lastName: '',
  gender: '',
  email: '',
  streetAddress: '',
  streetAddress2: '',
  city: '',
  state: '',
  postalCode: '',
  sectionConference: '',
  occupation: '',
  arrivalDate: '',
  departureDate: '',
  programPreference: '',
  howDidYouKnow: '',
  pastAttendance: '',
  emergencyContactName: '',
}

const DUPLICATE_EMAIL_MESSAGE = 'A registration with this email already exists. Please use Already Registered to view or continue your registration.'

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-display font-bold text-navy mb-4 flex items-center gap-2">
      <span className="w-1 h-5 rounded-full bg-gradient-to-b from-primary to-secondary" />
      {children}
    </h3>
  )
}

function FormHeader() {
  return (
    <div className="text-center mb-8 pb-6 border-b border-gray-100">
      <h2 className="font-display text-2xl md:text-3xl font-bold text-navy mb-1">
        {EVENT.name}
      </h2>
      <p className="text-primary font-medium text-sm">{EVENT.venue}</p>
    </div>
  )
}

function FieldError({ error }: { error?: string }) {
  if (!error) return null
  return (
    <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
      <AlertCircle size={12} className="shrink-0" />
      {error}
    </p>
  )
}

export default function RegisterForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const [form, setForm] = useState<FormData>(INITIAL)
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null)
  const [screenshotError, setScreenshotError] = useState('')
  const [errors, setErrors] = useState<string[]>([])
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [paymentOption, setPaymentOption] = useState<'pay_now' | 'pay_later'>('pay_now')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [successfulPaymentOption, setSuccessfulPaymentOption] = useState<'pay_now' | 'pay_later' | null>(null)
  const [phoneCountryCode, setPhoneCountryCode] = useState(DEFAULT_COUNTRY_CALLING_CODE)
  const [phoneLocalNumber, setPhoneLocalNumber] = useState('')
  const [emergencyCountryCode, setEmergencyCountryCode] = useState(DEFAULT_COUNTRY_CALLING_CODE)
  const [emergencyLocalNumber, setEmergencyLocalNumber] = useState('')

  const feeInfo = useMemo(
    () =>
      form.occupation
        ? calculateFee(form.occupation, form.programPreference)
        : null,
    [form.occupation, form.programPreference],
  )

  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => {
      if (!(field in prev)) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const update = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors([])
    clearFieldError(field)
  }

  const resetPhoneFields = () => {
    setPhoneCountryCode(DEFAULT_COUNTRY_CALLING_CODE)
    setPhoneLocalNumber('')
    setEmergencyCountryCode(DEFAULT_COUNTRY_CALLING_CODE)
    setEmergencyLocalNumber('')
  }

  const phoneValidationError = (label: string, countryCode: string, localNumber: string) => {
    if (!countryCode) return 'Select a country calling code'
    if (!localNumber) return `${label} is required`
    return isValidNationalPhoneNumber(countryCode, localNumber)
      ? ''
      : nationalPhoneNumberLengthError(label, countryCode)
  }

  const syncPhoneFieldError = (
    field: 'phone' | 'emergencyContactNumber',
    label: string,
    countryCode: string,
    localNumber: string,
    force = false,
  ) => {
    setFieldErrors((prev) => {
      if (!force && !(field in prev)) return prev
      const error = localNumber ? phoneValidationError(label, countryCode, localNumber) : ''
      if (!error && !(field in prev)) return prev
      const next = { ...prev }
      if (error) next[field] = error
      else delete next[field]
      return next
    })
  }

  const handleCountryCodeChange = (field: 'phone' | 'emergencyContactNumber', value: string) => {
    const localNumber = field === 'phone' ? phoneLocalNumber : emergencyLocalNumber
    const label = field === 'phone' ? 'Phone number' : 'Emergency contact number'
    if (field === 'phone') setPhoneCountryCode(value)
    else setEmergencyCountryCode(value)
    setErrors([])
    syncPhoneFieldError(field, label, value, localNumber, Boolean(localNumber))
  }

  const handleLocalNumberChange = (field: 'phone' | 'emergencyContactNumber', value: string) => {
    const trimmedValue = value.trim()
    const parsed = trimmedValue.startsWith('+') ? splitInternationalPhone(trimmedValue) : null
    const countryCode = parsed?.countryCode || (field === 'phone' ? phoneCountryCode : emergencyCountryCode)
    const maxLength = getCountryCallingCodeOption(countryCode)?.maxLength || 15
    const localNumber = (parsed?.localNumber || value.replace(/\D/g, '')).slice(0, maxLength)
    const label = field === 'phone' ? 'Phone number' : 'Emergency contact number'

    if (field === 'phone') {
      if (parsed) setPhoneCountryCode(parsed.countryCode)
      setPhoneLocalNumber(localNumber)
    } else {
      if (parsed) setEmergencyCountryCode(parsed.countryCode)
      setEmergencyLocalNumber(localNumber)
    }

    setErrors([])
    syncPhoneFieldError(field, label, countryCode, localNumber)
  }

  const handleScreenshotChange = (file: File | null, preview: string | null) => {
    setScreenshot(file)
    setScreenshotPreview(preview)
    setScreenshotError('')
    setErrors([])
    setFieldErrors({})
  }

  const handlePaymentOptionChange = (option: 'pay_now' | 'pay_later') => {
    setPaymentOption(option)
    setScreenshotError('')
    if (option === 'pay_later' && (screenshot || screenshotPreview)) {
      if (screenshotPreview) URL.revokeObjectURL(screenshotPreview)
      setScreenshot(null)
      setScreenshotPreview(null)
    }
  }

  const resetForm = () => {
    setForm(INITIAL)
    resetPhoneFields()
    setPaymentOption('pay_now')
    setScreenshot(null)
    if (screenshotPreview) URL.revokeObjectURL(screenshotPreview)
    setScreenshotPreview(null)
    setScreenshotError('')
    setErrors([])
    setFieldErrors({})
    setMessage('')
    setSuccessfulPaymentOption(null)
  }

  const validateForm = (): Record<string, string> => {
    const errs: Record<string, string> = {}
    if (!form.firstName.trim()) errs.firstName = 'First name is required'
    if (!form.lastName.trim()) errs.lastName = 'Last name is required'
    if (!form.gender) errs.gender = 'Please select a gender'
    const phoneError = phoneValidationError('Phone number', phoneCountryCode, phoneLocalNumber)
    if (phoneError) errs.phone = phoneError
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'A valid email is required'
    }
    if (!form.streetAddress.trim()) errs.streetAddress = 'Street address is required'
    if (!form.city.trim()) errs.city = 'City is required'
    if (!form.state.trim()) errs.state = 'State is required'
    if (!form.postalCode.trim()) errs.postalCode = 'Postal / zip code is required'
    if (!form.sectionConference.trim()) errs.sectionConference = 'Section / Conference is required'
    if (!form.occupation) errs.occupation = 'Please select an occupation'
    if (!form.arrivalDate) errs.arrivalDate = 'Expected date of arrival is required'
    else if (form.arrivalDate < EVENT.registrationDates.min || form.arrivalDate > EVENT.registrationDates.max) {
      errs.arrivalDate = 'Arrival date must be between Oct 13 and Oct 21, 2026'
    }
    if (!form.departureDate) errs.departureDate = 'Expected date of departure is required'
    else if (form.departureDate < EVENT.registrationDates.min || form.departureDate > EVENT.registrationDates.max) {
      errs.departureDate = 'Departure date must be between Oct 13 and Oct 21, 2026'
    }
    if (form.arrivalDate && form.departureDate && form.departureDate < form.arrivalDate) {
      errs.departureDate = 'Departure date cannot be before the arrival date'
    }
    if (!form.howDidYouKnow) errs.howDidYouKnow = 'Please select how you heard about IYC'
    if (!form.pastAttendance) errs.pastAttendance = 'Please indicate if you attended IYC before'
    if (!form.emergencyContactName.trim()) errs.emergencyContactName = 'Emergency contact name is required'
    const emergencyPhoneError = phoneValidationError(
      'Emergency contact number',
      emergencyCountryCode,
      emergencyLocalNumber,
    )
    if (emergencyPhoneError) errs.emergencyContactNumber = emergencyPhoneError
    return errs
  }

  const FIELD_ID_MAP: Record<string, string> = {
    firstName: 'firstName',
    lastName: 'lastName',
    gender: 'gender',
    phone: 'phone-local-number',
    email: 'email',
    streetAddress: 'streetAddress',
    city: 'city',
    state: 'state',
    postalCode: 'postalCode',
    sectionConference: 'sectionConference',
    occupation: 'occupation',
    arrivalDate: 'arrivalDate',
    departureDate: 'departureDate',
    howDidYouKnow: 'howDidYouKnow',
    pastAttendance: 'pastAttendance',
    emergencyContactName: 'emergency-contact-name',
    emergencyContactNumber: 'emergency-contact-number-local-number',
    screenshot: 'payment-section',
  }

  const FIELD_ORDER = [
    'firstName',
    'lastName',
    'gender',
    'phone',
    'email',
    'streetAddress',
    'city',
    'state',
    'postalCode',
    'sectionConference',
    'occupation',
    'arrivalDate',
    'departureDate',
    'howDidYouKnow',
    'pastAttendance',
    'emergencyContactName',
    'emergencyContactNumber',
  ] as const

  const focusFirstError = (validationErrors: Record<string, string>, screenshotMissing: boolean) => {
    const firstErrorKey = FIELD_ORDER.find((key) => key in validationErrors) || (screenshotMissing ? 'screenshot' : null)
    if (!firstErrorKey) return
    const targetId = FIELD_ID_MAP[firstErrorKey]
    window.requestAnimationFrame(() => {
      const el = document.getElementById(targetId) || document.querySelector(`[data-field="${firstErrorKey}"]`) as HTMLElement | null
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        if ('focus' in el && typeof (el as HTMLElement).focus === 'function') {
          ;(el as HTMLElement).focus({ preventScroll: true } as FocusOptions)
        } else {
          const focusable = el.querySelector('input, select, textarea, button') as HTMLElement | null
          focusable?.focus({ preventScroll: true } as FocusOptions)
          focusable?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }
    })
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrors([])
    setMessage('')
    setScreenshotError('')

    const validationErrors = validateForm()
    const screenshotMissing = paymentOption === 'pay_now' && !screenshot
    setScreenshotError(
      screenshotMissing ? 'Please attach a screenshot of your payment before submitting.' : '',
    )

    if (Object.keys(validationErrors).length > 0 || screenshotMissing) {
      if (Object.keys(validationErrors).length > 0) setFieldErrors(validationErrors)
      setStatus('error')
      focusFirstError(validationErrors, screenshotMissing)
      return
    }

    setStatus('loading')

    const body = new FormData()
    Object.entries(form).forEach(([key, value]) => body.append(key, value))
    body.append('phone', toInternationalPhone(phoneCountryCode, phoneLocalNumber))
    body.append(
      'emergencyContactNumber',
      toInternationalPhone(emergencyCountryCode, emergencyLocalNumber),
    )
    if (feeInfo) {
      body.append('fee', String(feeInfo.fee))
      body.append('feeLabel', feeInfo.label)
    }
    body.append('paymentOption', paymentOption)
    if (paymentOption === 'pay_now' && screenshot) body.append('paymentScreenshot', screenshot)

    try {
      const res = await fetch('/api/register', { method: 'POST', body })
      const data = await res.json()

      if (!res.ok) {
        setStatus('error')
        if (data.code === 'REGISTRATION_EMAIL_EXISTS') {
          setErrors([])
          setMessage('')
          setFieldErrors((prev) => ({ ...prev, email: DUPLICATE_EMAIL_MESSAGE }))
          window.requestAnimationFrame(() => {
            const el = document.getElementById('email') as HTMLElement | null
            el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            el?.focus({ preventScroll: true } as FocusOptions)
          })
        } else {
          setErrors(data.errors || [data.message || 'Submission failed'])
        }
        return
      }

      if (screenshotPreview) URL.revokeObjectURL(screenshotPreview)
      setScreenshot(null)
      setScreenshotPreview(null)
      setForm(INITIAL)
      resetPhoneFields()
      setPaymentOption('pay_now')
      setSuccessfulPaymentOption(paymentOption)
      setStatus('success')
      setMessage(data.message)
    } catch {
      setStatus('error')
      setMessage('Could not reach the server. Make sure the backend is running.')
    }
  }

  const submitAnotherRegistration = () => {
    resetForm()
    setStatus('idle')
    window.requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-8">
      <FormHeader />

      {(errors.length > 0 || (status === 'error' && message)) && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex gap-3">
          <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={18} />
          <div>
            {message && <p className="text-red-600 text-sm mb-1">{message}</p>}
            {errors.map((err) => (
              <p key={err} className="text-red-500 text-sm">{err}</p>
            ))}
          </div>
        </div>
      )}

      {/* Name */}
      <div>
        <SectionLabel>Name</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <input id="firstName" type="text" placeholder="First Name *" required value={form.firstName} onChange={(e) => update('firstName', e.target.value)} className="input-modern" aria-invalid={Boolean(fieldErrors.firstName)} aria-describedby={fieldErrors.firstName ? 'firstName-error' : undefined} />
            <FieldError error={fieldErrors.firstName} />
          </div>
          <div>
            <input id="lastName" type="text" placeholder="Last Name *" required value={form.lastName} onChange={(e) => update('lastName', e.target.value)} className="input-modern" aria-invalid={Boolean(fieldErrors.lastName)} aria-describedby={fieldErrors.lastName ? 'lastName-error' : undefined} />
            <FieldError error={fieldErrors.lastName} />
          </div>
        </div>
      </div>

      {/* Gender & Phone */}
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="gender" className="text-xs font-medium text-gray-500 mb-1.5 block">Gender *</label>
            <select id="gender" required value={form.gender} onChange={(e) => update('gender', e.target.value)} className="input-modern" aria-invalid={Boolean(fieldErrors.gender)}>
              <option value="">Please Select</option>
              {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
            <FieldError error={fieldErrors.gender} />
          </div>
          <PhoneNumberField
            id="phone"
            label="Phone Number"
            required
            countryCode={phoneCountryCode}
            localNumber={phoneLocalNumber}
            onCountryCodeChange={(value) => handleCountryCodeChange('phone', value)}
            onLocalNumberChange={(value) => handleLocalNumberChange('phone', value)}
            error={fieldErrors.phone}
          />
        </div>
      </div>

      {/* Address */}
      <div>
        <SectionLabel>Address</SectionLabel>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <input id="streetAddress" type="text" placeholder="Street Address Line 1 *" required value={form.streetAddress} onChange={(e) => update('streetAddress', e.target.value)} className="input-modern" aria-invalid={Boolean(fieldErrors.streetAddress)} />
            <FieldError error={fieldErrors.streetAddress} />
          </div>
          <input type="text" placeholder="Street Address Line 2" value={form.streetAddress2} onChange={(e) => update('streetAddress2', e.target.value)} className="input-modern" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <input id="city" type="text" placeholder="City *" required value={form.city} onChange={(e) => update('city', e.target.value)} className="input-modern" aria-invalid={Boolean(fieldErrors.city)} />
              <FieldError error={fieldErrors.city} />
            </div>
            <div>
              <input id="state" type="text" placeholder="State / Province *" required value={form.state} onChange={(e) => update('state', e.target.value)} className="input-modern" aria-invalid={Boolean(fieldErrors.state)} />
              <FieldError error={fieldErrors.state} />
            </div>
            <div>
              <input id="postalCode" type="text" placeholder="Postal / Zip Code *" required value={form.postalCode} onChange={(e) => update('postalCode', e.target.value)} className="input-modern" aria-invalid={Boolean(fieldErrors.postalCode)} />
              <FieldError error={fieldErrors.postalCode} />
            </div>
          </div>
        </div>
      </div>

      {/* Email */}
      <div>
        <SectionLabel>E-mail</SectionLabel>
        <input id="email" type="email" placeholder="ex:myname@example.com*" required value={form.email} onChange={(e) => update('email', e.target.value)} className="input-modern" aria-invalid={Boolean(fieldErrors.email)} />
        <FieldError error={fieldErrors.email} />
        {fieldErrors.email === DUPLICATE_EMAIL_MESSAGE && (
          <Link to="/" className="mt-2 inline-block text-sm font-semibold text-primary hover:text-primary-dark">
            Already Registered
          </Link>
        )}
      </div>

      {/* Section & Occupation */}
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="sectionConference" className="text-xs font-medium text-gray-500 mb-1.5 block">Section / Conference you are coming from *</label>
            <input id="sectionConference" type="text" required value={form.sectionConference} onChange={(e) => update('sectionConference', e.target.value)} className="input-modern" aria-invalid={Boolean(fieldErrors.sectionConference)} />
            <FieldError error={fieldErrors.sectionConference} />
          </div>
          <div>
            <label htmlFor="occupation" className="text-xs font-medium text-gray-500 mb-1.5 block">Occupation *</label>
            <select id="occupation" required value={form.occupation} onChange={(e) => update('occupation', e.target.value)} className="input-modern" aria-invalid={Boolean(fieldErrors.occupation)}>
              <option value="">Please Select</option>
              {OCCUPATIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
            <FieldError error={fieldErrors.occupation} />
          </div>
        </div>
        {feeInfo && (
          <p className="mt-3 text-sm text-gray-500">
            Estimated fee: <strong className="text-primary">{feeInfo.label} — ₹{feeInfo.fee}</strong>
          </p>
        )}
      </div>

      {/* Travel dates */}
      <div>
        <SectionLabel>Travel Dates</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="arrivalDate" className="text-xs font-medium text-gray-500 mb-1.5 block">Expected date of Arrival *</label>
            <input id="arrivalDate" type="date" required min={EVENT.registrationDates.min} max={EVENT.registrationDates.max} value={form.arrivalDate} onChange={(e) => update('arrivalDate', e.target.value)} className="input-modern" aria-invalid={Boolean(fieldErrors.arrivalDate)} />
            <FieldError error={fieldErrors.arrivalDate} />
          </div>
          <div>
            <label htmlFor="departureDate" className="text-xs font-medium text-gray-500 mb-1.5 block">Expected date of Departure *</label>
            <input id="departureDate" type="date" required min={EVENT.registrationDates.min} max={EVENT.registrationDates.max} value={form.departureDate} onChange={(e) => update('departureDate', e.target.value)} className="input-modern" aria-invalid={Boolean(fieldErrors.departureDate)} />
            <FieldError error={fieldErrors.departureDate} />
          </div>
        </div>
        <p className="mt-2 text-xs text-gray-500">Select a date between {EVENT.registrationDates.min} and {EVENT.registrationDates.max}.</p>
      </div>

      {/* Program preference */}
      <div>
        <SectionLabel>When would you prefer to attend the program?</SectionLabel>
        <div className="flex flex-wrap gap-4">
          {PROGRAM_PREFERENCES.map((pref) => (
            <label key={pref} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="programPreference"
                value={pref}
                checked={form.programPreference === pref}
                onChange={(e) => update('programPreference', e.target.value)}
                className="accent-primary"
              />
              <span className="text-sm text-gray-700">{pref}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Referral & history */}
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="howDidYouKnow" className="text-xs font-medium text-gray-500 mb-1.5 block">How did you know about IYC? *</label>
            <select id="howDidYouKnow" required value={form.howDidYouKnow} onChange={(e) => update('howDidYouKnow', e.target.value)} className="input-modern" aria-invalid={Boolean(fieldErrors.howDidYouKnow)}>
              <option value="">Please Select</option>
              {HOW_DID_YOU_KNOW.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
            <FieldError error={fieldErrors.howDidYouKnow} />
          </div>
          <div>
            <label htmlFor="pastAttendance" className="text-xs font-medium text-gray-500 mb-1.5 block">Have you attended IYC meetings in the past? *</label>
            <select id="pastAttendance" required value={form.pastAttendance} onChange={(e) => update('pastAttendance', e.target.value)} className="input-modern" aria-invalid={Boolean(fieldErrors.pastAttendance)}>
              <option value="">Please Select</option>
              {PAST_ATTENDANCE.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
            <FieldError error={fieldErrors.pastAttendance} />
          </div>
        </div>
      </div>

      {/* Emergency contact */}
      <div>
        <SectionLabel>Emergency Contact</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
          <div>
            <label htmlFor="emergency-contact-name" className="text-xs font-medium text-gray-500 mb-1.5 block">Emergency Contact Name *</label>
            <input id="emergency-contact-name" type="text" placeholder="Emergency contact name" required value={form.emergencyContactName} onChange={(e) => update('emergencyContactName', e.target.value)} className="input-modern" />
            <FieldError error={fieldErrors.emergencyContactName} />
          </div>
          <PhoneNumberField
            id="emergency-contact-number"
            label="Emergency Contact Number"
            required
            countryCode={emergencyCountryCode}
            localNumber={emergencyLocalNumber}
            onCountryCodeChange={(value) => handleCountryCodeChange('emergencyContactNumber', value)}
            onLocalNumberChange={(value) => handleLocalNumberChange('emergencyContactNumber', value)}
            error={fieldErrors.emergencyContactNumber}
          />
        </div>
      </div>

      {/* Payment */}
      <div id="payment-section">
        <SectionLabel>Payment</SectionLabel>
        <PaymentSection
          fee={feeInfo?.fee}
          screenshot={screenshot}
          preview={screenshotPreview}
          paymentOption={paymentOption}
          onPaymentOptionChange={handlePaymentOptionChange}
          onScreenshotChange={handleScreenshotChange}
          error={screenshotError}
        />
      </div>

      {status === 'success' && successfulPaymentOption && (
        <motion.div
          role="status"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="scroll-mt-8 rounded-3xl border border-green-200 bg-green-50 p-6 text-center shadow-sm sm:p-8"
        >
          <CheckCircle className="mx-auto mb-4 text-green-500" size={42} />
          <h2 className="font-display text-2xl font-bold text-navy">Registration submitted successfully</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-green-800">{message}</p>
          {successfulPaymentOption === 'pay_later' && (
            <p className="mx-auto mt-3 max-w-xl text-xs leading-relaxed text-gray-600">
              You can complete payment later using the QR code or bank details available through Already Registered.
            </p>
          )}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button to="/" variant="primary" size="sm">Go to Home</Button>
            <Button onClick={submitAnotherRegistration} variant="outline" size="sm">Submit Another Registration</Button>
          </div>
        </motion.div>
      )}

      {status !== 'success' && (
        <Button type="submit" variant="primary" size="lg" className="w-full gap-2">
          {status === 'loading' ? (
            <><Loader2 size={18} className="animate-spin" /> Submitting...</>
          ) : (
            <><Send size={18} /> Submit</>
          )}
        </Button>
      )}
    </form>
  )
}
