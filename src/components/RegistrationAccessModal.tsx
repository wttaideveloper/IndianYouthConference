import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CheckCircle2,
  Clock3,
  CreditCard,
  ImageIcon,
  Info,
  LoaderCircle,
  Mail,
  QrCode,
  Upload,
  X,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { DONATION } from '../data/content'
import { PAYMENT_NOTE } from '../data/registration'
import {
  getAttendeeRegistrations,
  RegistrationAccessApiError,
  type PaymentState,
  type RegistrationAccessItem,
  requestRegistrationOtp,
  uploadPaymentProof,
  verifyRegistrationOtp,
} from '../lib/registrationAccessApi'

type Step = 'loading' | 'email' | 'otp' | 'registrations' | 'status' | 'empty'
type CooldownStatus = 'requested' | 'rate_limited' | null

interface RegistrationAccessModalProps {
  isOpen: boolean
  onClose: () => void
}

const OTP_RESEND_SECONDS = 60
const MAX_IMAGE_SIZE = 10 * 1024 * 1024
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const otpCooldownExpiries = new Map<string, number>()

function cooldownKey(email: string) {
  return email.trim().toLowerCase()
}

function getActiveCooldownExpiry(email: string) {
  const key = cooldownKey(email)
  const expiresAt = otpCooldownExpiries.get(key)
  if (!expiresAt || expiresAt <= Date.now()) {
    otpCooldownExpiries.delete(key)
    return null
  }
  return expiresAt
}

function getCooldownSeconds(expiresAt: number | null) {
  return expiresAt ? Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000)) : 0
}

function messageForError(error: unknown, fallback: string) {
  return error instanceof RegistrationAccessApiError ? error.message : fallback
}

function statusLabel(state: PaymentState) {
  switch (state) {
    case 'not_submitted':
      return 'Payment Pending'
    case 'under_review':
      return 'Payment Under Review'
    case 'verified':
      return 'Payment Verified'
    case 'rejected':
      return 'Payment Proof Rejected'
  }
}

function statusClasses(state: PaymentState) {
  switch (state) {
    case 'not_submitted':
      return 'bg-amber-50 text-amber-700 border-amber-200'
    case 'under_review':
      return 'bg-blue-50 text-blue-700 border-blue-200'
    case 'verified':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    case 'rejected':
      return 'bg-red-50 text-red-700 border-red-200'
  }
}

function PaymentInstructions({ item, replacement }: { item: RegistrationAccessItem; replacement?: boolean }) {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-primary/15 bg-primary/[0.04] p-4 flex gap-3">
        <Info className="mt-0.5 shrink-0 text-primary" size={18} />
        <div>
          <p className="font-semibold text-navy text-sm">{replacement ? 'Submit a replacement payment proof' : 'Complete your payment'}</p>
          {!replacement && <p className="mt-1 text-xs leading-relaxed text-gray-600">{PAYMENT_NOTE}</p>}
        </div>
      </div>

      <div className="rounded-2xl bg-navy p-4 text-white flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-white/50">Registration fee</p>
          <p className="mt-1 font-display text-2xl font-bold">₹{item.fee}</p>
          <p className="text-xs text-white/65">{item.feeLabel}</p>
        </div>
        <CreditCard className="text-accent" size={28} />
      </div>

      {!replacement && <p className="text-xs leading-relaxed text-gray-500">{DONATION.upiNote}</p>}

      <div className="grid gap-4 sm:grid-cols-[150px_1fr]">
        <div className="rounded-2xl border border-gray-100 bg-white p-3 flex flex-col items-center justify-center shadow-sm">
          <QrCode className="mb-2 text-primary" size={18} />
          <img
            src={DONATION.qrCode}
            alt="IYC payment QR code"
            className="h-28 w-28 object-contain"
            onError={(event) => {
              event.currentTarget.src = DONATION.qrCodeFallback
            }}
          />
          <span className="mt-2 text-[10px] font-medium uppercase tracking-wider text-gray-400">Scan to pay</span>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2 text-navy">
            <Building2 size={18} className="text-primary" />
            <h4 className="font-semibold text-sm">Bank transfer details</h4>
          </div>
          <dl className="space-y-2 text-xs">
            {[
              ['Account name', DONATION.accountName],
              ['Account no.', DONATION.accountNo],
              ['Bank', DONATION.bank],
              ['IFSC', DONATION.ifsc],
              ['UPI ID', DONATION.upiId],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                <dt className="text-gray-400">{label}</dt>
                <dd className="text-right font-medium text-gray-700 break-all">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}

function PaymentProofUpload({
  file,
  previewUrl,
  uploading,
  onPick,
  onRemove,
  onSubmit,
}: {
  file: File | null
  previewUrl: string | null
  uploading: boolean
  onPick: (file: File) => void
  onRemove: () => void
  onSubmit: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="rounded-2xl border border-dashed border-primary/35 bg-primary/[0.025] p-4">
      <div className="mb-3 flex items-start gap-3">
        <div className="rounded-xl bg-primary/10 p-2 text-primary"><Upload size={18} /></div>
        <div>
          <h4 className="font-semibold text-sm text-navy">Upload payment screenshot</h4>
          <p className="mt-0.5 text-xs text-gray-500">JPG, PNG or WEBP up to 10 MB.</p>
        </div>
      </div>

      {!file ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-5 text-sm font-medium text-primary transition-colors hover:border-primary/40 hover:bg-primary/[0.03]"
        >
          Choose screenshot
        </button>
      ) : (
        <div className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm">
          {previewUrl ? (
            <img src={previewUrl} alt="Selected payment screenshot" className="h-14 w-14 rounded-lg object-cover" />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gray-100 text-gray-400"><ImageIcon size={22} /></div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-navy">{file.name}</p>
            <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
          </div>
          <button type="button" onClick={onRemove} disabled={uploading} className="rounded-full p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-50" aria-label="Remove selected screenshot">
            <X size={18} />
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        disabled={uploading}
        onChange={(event) => {
          const selected = event.target.files?.[0]
          event.currentTarget.value = ''
          if (selected) onPick(selected)
        }}
      />

      <button
        type="button"
        onClick={onSubmit}
        disabled={!file || uploading}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
      >
        {uploading ? <LoaderCircle size={17} className="animate-spin" /> : <Upload size={17} />}
        {uploading ? 'Submitting payment proof…' : 'Submit payment proof'}
      </button>
    </div>
  )
}

export default function RegistrationAccessModal({ isOpen, onClose }: RegistrationAccessModalProps) {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [items, setItems] = useState<RegistrationAccessItem[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [cooldownSeconds, setCooldownSeconds] = useState(0)
  const [cooldownExpiresAt, setCooldownExpiresAt] = useState<number | null>(null)
  const [cooldownStatus, setCooldownStatus] = useState<CooldownStatus>(null)
  const [hasRequestedOtp, setHasRequestedOtp] = useState(false)
  const [isRequesting, setIsRequesting] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const clearFile = () => {
    setFile(null)
    setPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current)
      return null
    })
  }

  const showRegistrations = (nextItems: RegistrationAccessItem[]) => {
    setItems(nextItems)
    setSelectedId(nextItems.length === 1 ? nextItems[0].registrationId : null)
    setStep(nextItems.length === 0 ? 'empty' : nextItems.length === 1 ? 'status' : 'registrations')
  }

  const restoreCooldown = (nextEmail: string) => {
    const expiresAt = getActiveCooldownExpiry(nextEmail)
    const seconds = getCooldownSeconds(expiresAt)
    setCooldownExpiresAt(expiresAt)
    setCooldownSeconds(seconds)
    setCooldownStatus(seconds > 0 ? 'requested' : null)
    setHasRequestedOtp(seconds > 0)
  }

  const startCooldown = (nextEmail: string, status: Exclude<CooldownStatus, null>) => {
    const key = cooldownKey(nextEmail)
    const expiresAt = Math.max(getActiveCooldownExpiry(key) || 0, Date.now() + OTP_RESEND_SECONDS * 1000)
    otpCooldownExpiries.set(key, expiresAt)
    setCooldownExpiresAt(expiresAt)
    setCooldownSeconds(getCooldownSeconds(expiresAt))
    setCooldownStatus(status)
    setHasRequestedOtp(true)
  }

  const loadRegistrations = async ({ showSessionExpired = false }: { showSessionExpired?: boolean } = {}) => {
    setStep('loading')
    setError('')
    try {
      const response = await getAttendeeRegistrations()
      showRegistrations(response.items)
    } catch (loadError) {
      if (loadError instanceof RegistrationAccessApiError && loadError.status === 401) {
        setStep('email')
        if (showSessionExpired) {
          setError('Your access session has expired. Enter your email to receive a new code.')
        }
      } else {
        setStep('email')
        setError(messageForError(loadError, 'Unable to load your registration. Please try again.'))
      }
    }
  }

  useEffect(() => {
    if (!isOpen) return
    clearFile()
    setError('')
    setNotice('')
    setCode('')
    restoreCooldown(email)
    void loadRegistrations()
  }, [isOpen])

  useEffect(() => {
    if (!isOpen || !cooldownExpiresAt) return

    const updateCooldown = () => {
      const seconds = getCooldownSeconds(cooldownExpiresAt)
      setCooldownSeconds(seconds)
      if (seconds === 0) {
        const key = cooldownKey(email)
        if (otpCooldownExpiries.get(key) === cooldownExpiresAt) otpCooldownExpiries.delete(key)
        setCooldownExpiresAt(null)
        setCooldownStatus(null)
        setHasRequestedOtp(false)
      }
    }

    updateCooldown()
    const timer = window.setInterval(updateCooldown, 1000)
    return () => window.clearInterval(timer)
  }, [isOpen, cooldownExpiresAt, email])

  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
  }, [previewUrl])

  const requestOtp = async () => {
    const normalizedEmail = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError('Enter a valid email address.')
      return
    }

    setError('')
    setNotice('')
    setIsRequesting(true)
    try {
      await requestRegistrationOtp(normalizedEmail)
      setEmail(normalizedEmail)
      setCode('')
      startCooldown(normalizedEmail, 'requested')
      setStep('otp')
    } catch (requestError) {
      if (requestError instanceof RegistrationAccessApiError && requestError.status === 429) {
        setError('')
        startCooldown(normalizedEmail, 'rate_limited')
      } else {
        setError(messageForError(requestError, 'Unable to request a code. Please try again.'))
      }
    } finally {
      setIsRequesting(false)
    }
  }

  const verifyOtp = async () => {
    if (!/^\d{8}$/.test(code)) {
      setError('Enter the 8-digit verification code.')
      return
    }

    setError('')
    setIsSubmitting(true)
    try {
      await verifyRegistrationOtp(email, code)
      await loadRegistrations({ showSessionExpired: true })
    } catch (verifyError) {
      if (verifyError instanceof RegistrationAccessApiError && verifyError.status === 400) {
        setError('The verification code is invalid or expired. Request a new code and try again.')
      } else if (verifyError instanceof RegistrationAccessApiError && verifyError.status === 429) {
        setError('Too many attempts. Please wait a little and try again.')
      } else {
        setError(messageForError(verifyError, 'Unable to verify your code. Please try again.'))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectFile = (nextFile: File) => {
    setError('')
    if (!ACCEPTED_IMAGE_TYPES.includes(nextFile.type)) {
      setError('Choose a JPG, PNG or WEBP image.')
      return
    }
    if (nextFile.size > MAX_IMAGE_SIZE) {
      setError('The screenshot must be 10 MB or smaller.')
      return
    }

    setFile(nextFile)
    setPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current)
      return URL.createObjectURL(nextFile)
    })
  }

  const selectedItem = items.find((item) => item.registrationId === selectedId)
  const cooldownMessage = cooldownSeconds > 0
    ? cooldownStatus === 'rate_limited'
      ? 'Please wait before requesting another code.'
      : `You can request another code in ${cooldownSeconds} seconds.`
    : ''

  const changeEmail = (nextEmail: string) => {
    const changed = nextEmail.trim().toLowerCase() !== email.trim().toLowerCase()
    setEmail(nextEmail)
    setError('')
    setNotice('')
    if (changed) restoreCooldown(nextEmail)
  }

  const submitProof = async () => {
    if (!selectedItem || !file) return

    setError('')
    setNotice('')
    setIsSubmitting(true)
    try {
      const response = await uploadPaymentProof(selectedItem.registrationId, file)
      setItems((current) => current.map((item) => item.registrationId === response.item.registrationId ? response.item : item))
      clearFile()
      setNotice(response.warning || response.message)
    } catch (uploadError) {
      if (uploadError instanceof RegistrationAccessApiError && uploadError.status === 401) {
        clearFile()
        setStep('email')
        setError('Your access session has expired. Enter your email to receive a new code.')
      } else if (uploadError instanceof RegistrationAccessApiError && uploadError.status === 409 && uploadError.paymentState) {
        const paymentState = uploadError.paymentState
        setItems((current) => current.map((item) => item.registrationId === selectedItem.registrationId ? {
          ...item,
          paymentState,
          status: paymentState === 'verified' ? 'verified' : item.status,
          canUploadPaymentProof: false,
        } : item))
        clearFile()
        setError(uploadError.message)
      } else {
        setError(messageForError(uploadError, 'Unable to submit your payment proof. Please try again.'))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-navy/75 p-4 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}
      >
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="registration-access-title"
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.98 }}
          transition={{ duration: 0.2 }}
          className="relative max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-3xl bg-[#fcfcff] shadow-2xl"
          onMouseDown={(event) => event.stopPropagation()}
        >
          <div className="sticky top-0 z-10 flex items-start justify-between border-b border-gray-100 bg-[#fcfcff]/95 px-5 py-5 backdrop-blur sm:px-7">
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-primary">Attendee access</p>
              <h2 id="registration-access-title" className="font-display text-2xl font-bold text-navy">Already Registered?</h2>
            </div>
            <button type="button" onClick={onClose} className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-navy" aria-label="Close registration access">
              <X size={21} />
            </button>
          </div>

          <div className="p-5 sm:p-7">
            {error && <div role="alert" className="mb-5 flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="mt-0.5 shrink-0" size={17} />{error}</div>}
            {notice && <div role="status" className="mb-5 flex gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700"><CheckCircle2 className="mt-0.5 shrink-0" size={17} />{notice}</div>}

            {step === 'loading' && <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-sm text-gray-500"><LoaderCircle className="animate-spin text-primary" size={28} />Checking your secure access…</div>}

            {step === 'email' && (
              <div className="mx-auto max-w-md">
                <div className="mb-6 rounded-2xl bg-primary/[0.05] p-4 text-sm leading-relaxed text-gray-600"><Mail className="mb-2 text-primary" size={20} />Enter the email address used for registration. We will send a verification code if an active registration exists.</div>
                <label htmlFor="registration-access-email" className="mb-2 block text-sm font-semibold text-navy">Email address</label>
                <input id="registration-access-email" type="email" autoComplete="email" value={email} onChange={(event) => changeEmail(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') void requestOtp() }} disabled={isRequesting} className="input-modern w-full" placeholder="you@example.com" />
                <button type="button" onClick={() => void requestOtp()} disabled={isRequesting || cooldownSeconds > 0} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary px-4 py-3 font-semibold text-white shadow-lg shadow-primary/20 disabled:cursor-not-allowed disabled:opacity-50">
                  {isRequesting && <LoaderCircle size={17} className="animate-spin" />}{isRequesting ? 'Sending code…' : hasRequestedOtp ? 'Resend verification code' : 'Send verification code'}
                </button>
                {cooldownMessage && <p role="status" className="mt-3 text-center text-sm font-medium text-primary">{cooldownMessage}</p>}
                <p className="mt-5 text-center text-xs leading-relaxed text-gray-500">If you don&apos;t receive a code, check that you entered the same email used during registration.</p>
                <Link to="/register" onClick={onClose} className="mt-4 block text-center text-sm font-semibold text-primary hover:text-primary-dark">Register Now</Link>
              </div>
            )}

            {step === 'otp' && (
              <div className="mx-auto max-w-md">
                <button type="button" onClick={() => { setStep('email'); setCode(''); setError(''); setNotice('') }} className="mb-5 inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-dark"><ArrowLeft size={16} />Change email</button>
                <p className="mb-5 text-sm leading-relaxed text-gray-600">Enter the 8-digit code sent to <strong className="text-navy">{email}</strong>.</p>
                <label htmlFor="registration-access-code" className="mb-2 block text-sm font-semibold text-navy">Verification code</label>
                <input id="registration-access-code" inputMode="numeric" autoComplete="one-time-code" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 8))} onKeyDown={(event) => { if (event.key === 'Enter') void verifyOtp() }} disabled={isSubmitting} className="input-modern w-full text-center font-mono text-xl tracking-[0.45em]" placeholder="00000000" maxLength={8} />
                <button type="button" onClick={() => void verifyOtp()} disabled={isSubmitting || code.length !== 8} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary px-4 py-3 font-semibold text-white shadow-lg shadow-primary/20 disabled:cursor-not-allowed disabled:opacity-50">
                  {isSubmitting && <LoaderCircle size={17} className="animate-spin" />}{isSubmitting ? 'Verifying…' : 'Verify and continue'}
                </button>
                <button type="button" onClick={() => void requestOtp()} disabled={isRequesting || cooldownSeconds > 0} className="mt-4 w-full text-sm font-medium text-primary disabled:text-gray-400">
                  Resend verification code
                </button>
                {cooldownMessage && <p role="status" className="mt-3 text-center text-sm font-medium text-primary">{cooldownMessage}</p>}
                <p className="mt-5 text-center text-xs leading-relaxed text-gray-500">If you don&apos;t receive a code, check that you entered the same email used during registration.</p>
                <Link to="/register" onClick={onClose} className="mt-4 block text-center text-sm font-semibold text-primary hover:text-primary-dark">Register Now</Link>
              </div>
            )}

            {step === 'empty' && <div className="mx-auto flex max-w-md flex-col items-center py-10 text-center"><Info className="mb-4 text-primary" size={34} /><h3 className="font-display text-xl font-bold text-navy">No active registration found</h3><p className="mt-2 text-sm leading-relaxed text-gray-500">You can start a new registration whenever you are ready.</p><Link to="/register" onClick={onClose} className="mt-6 rounded-xl bg-gradient-to-r from-primary to-secondary px-5 py-3 text-sm font-semibold text-white">Start new registration</Link></div>}

            {step === 'registrations' && (
              <div>
                <p className="mb-5 text-sm text-gray-600">Choose the registration you want to view.</p>
                <div className="space-y-3">
                  {items.map((item) => <button type="button" key={item.registrationId} onClick={() => { setSelectedId(item.registrationId); setStep('status'); setError(''); setNotice('') }} className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-left transition-all hover:border-primary/40 hover:shadow-md"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-navy">{item.fullName}</p><p className="mt-1 text-xs text-gray-500">₹{item.fee} · {item.feeLabel}</p><p className="mt-1 text-xs text-gray-400">Registered {new Date(item.createdAt).toLocaleDateString()}</p></div><span className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusClasses(item.paymentState)}`}>{statusLabel(item.paymentState)}</span></div></button>)}
                </div>
              </div>
            )}

            {step === 'status' && selectedItem && (
              <div>
                {items.length > 1 && <button type="button" onClick={() => { setStep('registrations'); clearFile(); setError(''); setNotice('') }} className="mb-5 inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-dark"><ArrowLeft size={16} />All registrations</button>}
                <div className="mb-5 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-display text-xl font-bold text-navy">{selectedItem.fullName}</p><p className="mt-1 text-sm text-gray-500">{selectedItem.email}</p><p className="mt-3 text-xs text-gray-400">Registration ID: {selectedItem.registrationId}</p></div><span className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${statusClasses(selectedItem.paymentState)}`}>{statusLabel(selectedItem.paymentState)}</span></div></div>

                {selectedItem.paymentState === 'not_submitted' && <><PaymentInstructions item={selectedItem} /><div className="mt-5"><PaymentProofUpload file={file} previewUrl={previewUrl} uploading={isSubmitting} onPick={selectFile} onRemove={clearFile} onSubmit={() => void submitProof()} /></div></>}
                {selectedItem.paymentState === 'rejected' && <><div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><AlertCircle className="mr-2 inline-block align-text-bottom" size={18} />Your previous payment proof was rejected. Please submit a clear replacement.</div><PaymentInstructions item={selectedItem} replacement /><div className="mt-5"><PaymentProofUpload file={file} previewUrl={previewUrl} uploading={isSubmitting} onPick={selectFile} onRemove={clearFile} onSubmit={() => void submitProof()} /></div></>}
                {selectedItem.paymentState === 'under_review' && <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 text-center"><Clock3 className="mx-auto mb-3 text-blue-600" size={32} /><h3 className="font-display text-xl font-bold text-navy">Payment proof under review</h3><p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-gray-600">Your payment proof has been submitted and is waiting for an administrator to review it. No further upload is needed.</p></div>}
                {selectedItem.paymentState === 'verified' && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center"><CheckCircle2 className="mx-auto mb-3 text-emerald-600" size={34} /><h3 className="font-display text-xl font-bold text-navy">Payment verified</h3><p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-gray-600">Your payment has been verified. We look forward to seeing you at IYC 2026.</p></div>}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
