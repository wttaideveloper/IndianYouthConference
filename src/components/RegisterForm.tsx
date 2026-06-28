import { useState, FormEvent, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import Button from './Button'
import PaymentSection from './PaymentSection'
import { EVENT } from '../data/content'
import {
  OCCUPATIONS,
  GENDERS,
  PROGRAM_PREFERENCES,
  HOW_DID_YOU_KNOW,
  PAST_ATTENDANCE,
  calculateFee,
} from '../data/registration'

interface FormData {
  firstName: string
  lastName: string
  gender: string
  phone: string
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
  emergencyContactNumber: string
}

const INITIAL: FormData = {
  firstName: '',
  lastName: '',
  gender: '',
  phone: '',
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
  emergencyContactNumber: '',
}

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

export default function RegisterForm() {
  const [form, setForm] = useState<FormData>(INITIAL)
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null)
  const [screenshotError, setScreenshotError] = useState('')
  const [errors, setErrors] = useState<string[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const feeInfo = useMemo(
    () =>
      form.occupation
        ? calculateFee(form.occupation, form.programPreference)
        : null,
    [form.occupation, form.programPreference],
  )

  const update = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors([])
  }

  const handleScreenshotChange = (file: File | null, preview: string | null) => {
    setScreenshot(file)
    setScreenshotPreview(preview)
    setScreenshotError('')
    setErrors([])
  }

  const resetForm = () => {
    setForm(INITIAL)
    setScreenshot(null)
    if (screenshotPreview) URL.revokeObjectURL(screenshotPreview)
    setScreenshotPreview(null)
    setScreenshotError('')
    setErrors([])
    setMessage('')
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrors([])
    setMessage('')
    setScreenshotError('')

    if (!screenshot) {
      setScreenshotError('Please attach a screenshot of your payment before submitting.')
      return
    }

    setStatus('loading')

    const body = new FormData()
    Object.entries(form).forEach(([key, value]) => body.append(key, value))
    if (feeInfo) {
      body.append('fee', String(feeInfo.fee))
      body.append('feeLabel', feeInfo.label)
    }
    body.append('paymentScreenshot', screenshot)

    try {
      const res = await fetch('/api/register', { method: 'POST', body })
      const data = await res.json()

      if (!res.ok) {
        setStatus('error')
        setErrors(data.errors || [data.message || 'Submission failed'])
        return
      }

      if (screenshotPreview) URL.revokeObjectURL(screenshotPreview)
      setScreenshot(null)
      setScreenshotPreview(null)
      setForm(INITIAL)
      setStatus('success')
      setMessage(data.message)
    } catch {
      setStatus('error')
      setMessage('Could not reach the server. Make sure the backend is running.')
    }
  }

  if (status === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12 px-6"
      >
        <div className="w-20 h-20 rounded-3xl bg-green-50 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="text-green-500" size={40} />
        </div>
        <h3 className="font-display text-2xl font-bold text-navy mb-3">Registration Submitted!</h3>
        <p className="text-gray-500 max-w-md mx-auto mb-8 text-sm">{message}</p>
        <Button onClick={() => { resetForm(); setStatus('idle') }} variant="outline">
          Submit Another Registration
        </Button>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
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
          <input type="text" placeholder="First Name *" required value={form.firstName} onChange={(e) => update('firstName', e.target.value)} className="input-modern" />
          <input type="text" placeholder="Last Name *" required value={form.lastName} onChange={(e) => update('lastName', e.target.value)} className="input-modern" />
        </div>
      </div>

      {/* Gender & Phone */}
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">Gender *</label>
            <select required value={form.gender} onChange={(e) => update('gender', e.target.value)} className="input-modern">
              <option value="">Please Select</option>
              {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">Phone Number *</label>
            <input type="tel" placeholder="+91 XXXXXXXXXX" required value={form.phone} onChange={(e) => update('phone', e.target.value)} className="input-modern" />
          </div>
        </div>
      </div>

      {/* Address */}
      <div>
        <SectionLabel>Address</SectionLabel>
        <div className="grid grid-cols-1 gap-4">
          <input type="text" placeholder="Street Address *" required value={form.streetAddress} onChange={(e) => update('streetAddress', e.target.value)} className="input-modern" />
          <input type="text" placeholder="Street Address Line 2" value={form.streetAddress2} onChange={(e) => update('streetAddress2', e.target.value)} className="input-modern" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input type="text" placeholder="City *" required value={form.city} onChange={(e) => update('city', e.target.value)} className="input-modern" />
            <input type="text" placeholder="State / Province *" required value={form.state} onChange={(e) => update('state', e.target.value)} className="input-modern" />
            <input type="text" placeholder="Postal / Zip Code *" required value={form.postalCode} onChange={(e) => update('postalCode', e.target.value)} className="input-modern" />
          </div>
        </div>
      </div>

      {/* Email */}
      <div>
        <SectionLabel>E-mail</SectionLabel>
        <input type="email" placeholder="ex: myname@example.com" required value={form.email} onChange={(e) => update('email', e.target.value)} className="input-modern" />
      </div>

      {/* Section & Occupation */}
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">Section / Conference you are coming from *</label>
            <input type="text" required value={form.sectionConference} onChange={(e) => update('sectionConference', e.target.value)} className="input-modern" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">Occupation *</label>
            <select required value={form.occupation} onChange={(e) => update('occupation', e.target.value)} className="input-modern">
              <option value="">Please Select</option>
              {OCCUPATIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
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
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">Expected date of Arrival *</label>
            <input type="date" required value={form.arrivalDate} onChange={(e) => update('arrivalDate', e.target.value)} className="input-modern" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">Expected date of Departure *</label>
            <input type="date" required value={form.departureDate} onChange={(e) => update('departureDate', e.target.value)} className="input-modern" />
          </div>
        </div>
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

      {/* Accommodation notice */}
      <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 text-sm text-amber-800">
        Accommodation at the camp site will be in dorm rooms and tents on raised concrete platforms.
      </div>

      {/* Referral & history */}
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">How did you know about IYC? *</label>
            <select required value={form.howDidYouKnow} onChange={(e) => update('howDidYouKnow', e.target.value)} className="input-modern">
              <option value="">Please Select</option>
              {HOW_DID_YOU_KNOW.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">Have you attended IYC meetings in the past? *</label>
            <select required value={form.pastAttendance} onChange={(e) => update('pastAttendance', e.target.value)} className="input-modern">
              <option value="">Please Select</option>
              {PAST_ATTENDANCE.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Emergency contact */}
      <div>
        <SectionLabel>Emergency Contact</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input type="text" placeholder="Emergency Contact Name *" required value={form.emergencyContactName} onChange={(e) => update('emergencyContactName', e.target.value)} className="input-modern" />
          <input type="tel" placeholder="Emergency Contact Number *" required value={form.emergencyContactNumber} onChange={(e) => update('emergencyContactNumber', e.target.value)} className="input-modern" />
        </div>
      </div>

      {/* Payment */}
      <div>
        <SectionLabel>Payment</SectionLabel>
        <PaymentSection
          fee={feeInfo?.fee}
          screenshot={screenshot}
          preview={screenshotPreview}
          onScreenshotChange={handleScreenshotChange}
          error={screenshotError}
        />
      </div>

      <Button type="submit" variant="primary" size="lg" className="w-full gap-2">
        {status === 'loading' ? (
          <><Loader2 size={18} className="animate-spin" /> Submitting...</>
        ) : (
          <><Send size={18} /> Submit</>
        )}
      </Button>
    </form>
  )
}
