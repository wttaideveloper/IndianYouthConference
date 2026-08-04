import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Loader2, Mail, Send, Users, X } from 'lucide-react'
import {
  fetchRegistration,
  fetchRegistrations,
  paymentStatusLabel,
  previewAdminEmailAudience,
  sendAdminEmailCampaign,
  type AdminEmailAudience,
  type AdminEmailCampaignResponse,
  type AdminEmailPreview,
  type Registration,
} from '../../lib/adminApi'

interface AdminEmailModalProps {
  isOpen: boolean
  registrationId?: string | null
  registrations?: Registration[]
  onClose: () => void
}

const AUDIENCES: { value: AdminEmailAudience; label: string }[] = [
  { value: 'all', label: 'All Registered' },
  { value: 'verified', label: 'Verified Attendees' },
  { value: 'payment_under_review', label: 'Payment Under Review' },
  { value: 'pay_later_unpaid', label: 'Pay Later — Not Paid' },
  { value: 'individual', label: 'Individual Attendee' },
]

const PLACEHOLDERS = [
  { token: '{{fullName}}', label: 'full name' },
  { token: '{{firstName}}', label: 'first name' },
  { token: '{{fee}}', label: 'fee' },
  { token: '{{status}}', label: 'status' },
  { token: '{{paymentOption}}', label: 'payment option' },
] as const

type ComposerField = 'subject' | 'message'

function makeIdempotencyKey() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  const randomValues = new Uint32Array(4)
  crypto.getRandomValues(randomValues)
  return Array.from(randomValues, (value) => value.toString(16)).join('-')
}

function audienceLabel(audience: AdminEmailAudience) {
  return AUDIENCES.find((option) => option.value === audience)?.label || audience
}

export default function AdminEmailModal({ isOpen, registrationId, registrations = [], onClose }: AdminEmailModalProps) {
  const [audience, setAudience] = useState<AdminEmailAudience>('all')
  const [preview, setPreview] = useState<AdminEmailPreview | null>(null)
  const [individual, setIndividual] = useState<Registration | null>(null)
  const [selectedRegistrationId, setSelectedRegistrationId] = useState<string | null>(null)
  const [candidateSearch, setCandidateSearch] = useState('')
  const [candidates, setCandidates] = useState<Registration[]>([])
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [idempotencyKey, setIdempotencyKey] = useState('')
  const [stage, setStage] = useState<'compose' | 'confirm' | 'result'>('compose')
  const [result, setResult] = useState<AdminEmailCampaignResponse | null>(null)
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [loadingIndividual, setLoadingIndividual] = useState(false)
  const [loadingCandidates, setLoadingCandidates] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [activeComposerField, setActiveComposerField] = useState<ComposerField | null>(null)
  const subjectInputRef = useRef<HTMLInputElement>(null)
  const messageTextareaRef = useRef<HTMLTextAreaElement>(null)

  const lockedIndividualMode = Boolean(registrationId)
  const activeRegistrationId = registrationId || selectedRegistrationId
  const missingIndividualTarget = audience === 'individual' && !activeRegistrationId

  useEffect(() => {
    if (!isOpen) return
    setAudience(registrationId ? 'individual' : 'all')
    setPreview(null)
    setIndividual(null)
    setSelectedRegistrationId(registrationId || null)
    setCandidateSearch('')
    setCandidates(registrations)
    setSubject('')
    setMessage('')
    setIdempotencyKey('')
    setStage('compose')
    setResult(null)
    setError('')
    setActiveComposerField(null)
  }, [isOpen, registrationId])

  useEffect(() => {
    if (!isOpen || audience !== 'individual' || lockedIndividualMode) return

    const search = candidateSearch.trim()
    if (!search) {
      setCandidates(registrations)
      return
    }

    let cancelled = false
    setLoadingCandidates(true)
    fetchRegistrations({ page: 1, limit: 100, search })
      .then((data) => {
        if (!cancelled) setCandidates(data.items)
      })
      .catch((candidateError) => {
        if (!cancelled) setError(candidateError instanceof Error ? candidateError.message : 'Unable to find attendees.')
      })
      .finally(() => {
        if (!cancelled) setLoadingCandidates(false)
      })

    return () => { cancelled = true }
  }, [isOpen, audience, lockedIndividualMode, candidateSearch, registrations])

  useEffect(() => {
    if (!isOpen || !registrationId) return
    let cancelled = false
    setLoadingIndividual(true)

    fetchRegistration(registrationId)
      .then((data) => {
        if (!cancelled) setIndividual(data.item)
      })
      .catch(() => {
        if (!cancelled) setError('Unable to load the selected attendee.')
      })
      .finally(() => {
        if (!cancelled) setLoadingIndividual(false)
      })

    return () => { cancelled = true }
  }, [isOpen, registrationId])

  useEffect(() => {
    if (!isOpen || missingIndividualTarget) {
      setPreview(null)
      return
    }

    let cancelled = false
    setLoadingPreview(true)
    setPreview(null)

    previewAdminEmailAudience({
      audience,
      ...(audience === 'individual' && activeRegistrationId ? { registrationId: activeRegistrationId } : {}),
    })
      .then((nextPreview) => {
        if (!cancelled) setPreview(nextPreview)
      })
      .catch((previewError) => {
        if (!cancelled) setError(previewError instanceof Error ? previewError.message : 'Unable to preview recipients.')
      })
      .finally(() => {
        if (!cancelled) setLoadingPreview(false)
      })

    return () => { cancelled = true }
  }, [isOpen, audience, activeRegistrationId, missingIndividualTarget])

  useEffect(() => {
    if (!isOpen) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !sending) onClose()
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [isOpen, onClose, sending])

  const canContinue = Boolean(
    preview &&
    preview.recipientCount > 0 &&
    subject.trim() &&
    message.trim() &&
    !loadingPreview &&
    !missingIndividualTarget,
  )

  const handleContinue = () => {
    setError('')
    if (!canContinue) return
    if (!idempotencyKey) setIdempotencyKey(makeIdempotencyKey())
    setStage('confirm')
  }

  const handleSend = async () => {
    if (!preview || sending) return
    setSending(true)
    setError('')
    try {
      const response = await sendAdminEmailCampaign({
        audience,
        ...(audience === 'individual' && activeRegistrationId ? { registrationId: activeRegistrationId } : {}),
        subject: subject.trim(),
        message: message.trim(),
        idempotencyKey,
      })
      setResult(response)
      setStage('result')
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : 'Unable to send the email campaign.')
    } finally {
      setSending(false)
    }
  }

  const selectIndividual = (candidate: Registration) => {
    setSelectedRegistrationId(candidate._id)
    setIndividual(candidate)
    setPreview(null)
    setIdempotencyKey('')
    setError('')
  }

  const insertPlaceholder = (placeholder: string) => {
    const field: ComposerField = activeComposerField || 'message'
    const input = field === 'subject' ? subjectInputRef.current : messageTextareaRef.current
    const value = field === 'subject' ? subject : message
    const start = input?.selectionStart ?? value.length
    const end = input?.selectionEnd ?? value.length
    const nextValue = value.slice(0, start) + placeholder + value.slice(end)
    const maximumLength = field === 'subject' ? 160 : 10_000

    if (nextValue.length > maximumLength) return

    if (field === 'subject') setSubject(nextValue)
    else setMessage(nextValue)
    setIdempotencyKey('')

    const caret = start + placeholder.length
    requestAnimationFrame(() => {
      input?.focus()
      input?.setSelectionRange(caret, caret)
    })
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[140] flex items-center justify-center bg-navy/70 p-4 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onMouseDown={(event) => { if (event.target === event.currentTarget && !sending) onClose() }}
      >
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-email-title"
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.98 }}
          className="w-full max-w-2xl max-h-[calc(100vh-2rem)] overflow-y-auto rounded-3xl bg-white shadow-2xl"
          onMouseDown={(event) => event.stopPropagation()}
        >
          <div className="flex items-start justify-between border-b border-gray-100 px-5 py-5 sm:px-6">
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Admin communication</p>
              <h2 id="admin-email-title" className="font-display text-2xl font-bold text-navy">Send Email</h2>
            </div>
            <button type="button" onClick={onClose} disabled={sending} className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-navy disabled:opacity-50" aria-label="Close email composer">
              <X size={20} />
            </button>
          </div>

          <div className="p-5 sm:p-6">
            {error && <div role="alert" className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

            {stage === 'compose' && (
              <div className="space-y-5">
                <div>
                  <label htmlFor="admin-email-audience" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">Audience</label>
                  <select
                    id="admin-email-audience"
                    value={audience}
                    disabled={lockedIndividualMode || sending}
                    onChange={(event) => {
                      const nextAudience = event.target.value as AdminEmailAudience
                      setAudience(nextAudience)
                      setSelectedRegistrationId(null)
                      setIndividual(null)
                      setCandidates(nextAudience === 'individual' ? registrations : [])
                      setIdempotencyKey('')
                      setError('')
                    }}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-navy focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-gray-50"
                  >
                    {AUDIENCES.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                </div>

                {audience === 'individual' && !lockedIndividualMode && (
                  <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
                    <div className="mb-3 flex items-center justify-between gap-3"><label htmlFor="admin-email-attendee-search" className="text-xs font-bold uppercase tracking-wider text-gray-400">Select attendee</label>{loadingCandidates && <Loader2 size={15} className="animate-spin text-primary" />}</div>
                    <input id="admin-email-attendee-search" value={candidateSearch} onChange={(event) => { setCandidateSearch(event.target.value); setError('') }} disabled={sending} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-navy focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Search by name or email…" />
                    <div className="mt-3 max-h-48 space-y-1 overflow-y-auto rounded-xl border border-gray-100 bg-white p-1">
                      {candidates.length > 0 ? candidates.map((candidate) => {
                        const selected = candidate._id === activeRegistrationId
                        return <button key={candidate._id} type="button" onClick={() => selectIndividual(candidate)} className={`w-full rounded-lg px-3 py-2.5 text-left transition-colors ${selected ? 'bg-primary/10 text-primary' : 'hover:bg-gray-50 text-navy'}`}><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-semibold">{candidate.fullName}</p><p className="truncate text-xs text-gray-500">{candidate.email}</p></div><span className="shrink-0 rounded-full bg-gray-100 px-2 py-1 text-[10px] font-semibold text-gray-600">{paymentStatusLabel(candidate.status, Boolean(candidate.paymentScreenshot?.filename))}</span></div></button>
                      }) : !loadingCandidates && <p className="px-3 py-4 text-center text-sm text-gray-500">No registered attendees found.</p>}
                    </div>
                  </div>
                )}

                {audience === 'individual' && (lockedIndividualMode || individual) && (
                  <div className="rounded-2xl border border-primary/15 bg-primary/[0.04] p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-primary">Selected attendee</p>
                    {loadingIndividual ? <p className="mt-2 text-sm text-gray-500">Loading attendee details…</p> : individual ? <><p className="mt-2 font-semibold text-navy">{individual.fullName}</p><p className="text-sm text-gray-500">{individual.email}</p></> : null}
                  </div>
                )}

                <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-navy"><Users size={17} className="text-primary" /><span className="text-sm font-semibold">Recipient preview</span></div>
                    {loadingPreview && <Loader2 size={16} className="animate-spin text-primary" />}
                  </div>
                  {preview ? <div className="mt-3 grid grid-cols-3 gap-3 text-center text-xs"><div><p className="font-display text-xl font-bold text-navy">{preview.recipientCount}</p><p className="text-gray-400">Recipients</p></div><div><p className="font-display text-xl font-bold text-navy">{preview.skippedInvalidEmails}</p><p className="text-gray-400">Skipped invalid</p></div><div><p className="font-display text-xl font-bold text-navy">{preview.duplicateEmailsSkipped}</p><p className="text-gray-400">Duplicates skipped</p></div></div> : !loadingPreview && !missingIndividualTarget && <p className="mt-3 text-sm text-gray-500">Recipient preview unavailable.</p>}
                </div>

                <div>
                  <div className="mb-1.5 flex justify-between gap-3"><label htmlFor="admin-email-subject" className="text-xs font-semibold uppercase tracking-wider text-gray-400">Subject</label><span className="text-xs text-gray-400">{subject.length}/160</span></div>
                  <input ref={subjectInputRef} id="admin-email-subject" value={subject} onFocus={() => setActiveComposerField('subject')} onChange={(event) => { setSubject(event.target.value); setIdempotencyKey('') }} maxLength={160} disabled={sending} className="w-full rounded-xl border border-gray-200 px-3 py-3 text-sm text-navy focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Email subject" />
                </div>

                <div>
                  <div className="mb-1.5 flex justify-between gap-3"><label htmlFor="admin-email-message" className="text-xs font-semibold uppercase tracking-wider text-gray-400">Message</label><span className="text-xs text-gray-400">{message.length}/10000</span></div>
                  <textarea ref={messageTextareaRef} id="admin-email-message" value={message} onFocus={() => setActiveComposerField('message')} onChange={(event) => { setMessage(event.target.value); setIdempotencyKey('') }} maxLength={10000} rows={8} disabled={sending} className="w-full resize-y rounded-xl border border-gray-200 px-3 py-3 text-sm leading-relaxed text-navy focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Write a plain-text message…" />
                  <div className="mt-3">
                    <p className="mb-2 text-xs font-semibold text-gray-500">Available placeholders</p>
                    <div className="flex flex-wrap gap-2">
                      {PLACEHOLDERS.map(({ token, label }) => (
                        <button key={token} type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => insertPlaceholder(token)} disabled={sending} aria-label={`Insert ${label} placeholder`} className="rounded-full border border-primary/20 bg-primary/[0.04] px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:border-primary/50 hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50">
                          {token}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button type="button" onClick={handleContinue} disabled={!canContinue || sending} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary px-4 py-3 text-sm font-semibold text-white shadow-md shadow-primary/20 disabled:cursor-not-allowed disabled:opacity-50">
                  Continue <Send size={16} />
                </button>
              </div>
            )}

            {stage === 'confirm' && preview && (
              <div className="space-y-5">
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                  <Mail size={23} className="mb-3 text-amber-600" />
                  <h3 className="font-display text-xl font-bold text-navy">Confirm email campaign</h3>
                  <dl className="mt-4 space-y-2 text-sm"><div className="flex justify-between gap-4"><dt className="text-gray-500">Audience</dt><dd className="font-semibold text-navy">{audienceLabel(audience)}</dd></div><div className="flex justify-between gap-4"><dt className="text-gray-500">Recipients</dt><dd className="font-semibold text-navy">{preview.recipientCount}</dd></div><div><dt className="text-gray-500">Subject</dt><dd className="mt-1 break-words font-semibold text-navy">{subject}</dd></div></dl>
                </div>
                <div className="flex gap-3"><button type="button" onClick={() => setStage('compose')} disabled={sending} className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50">Back</button><button type="button" onClick={() => void handleSend()} disabled={sending} className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary px-4 py-3 text-sm font-semibold text-white shadow-md shadow-primary/20 disabled:opacity-50">{sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}{sending ? 'Sending…' : 'Send Email'}</button></div>
              </div>
            )}

            {stage === 'result' && result && (
              <div className="py-4 text-center"><CheckCircle2 size={42} className="mx-auto mb-3 text-emerald-500" /><h3 className="font-display text-2xl font-bold text-navy">Campaign complete</h3><p className="mt-2 text-sm text-gray-500">Email delivery was processed individually for the selected audience.</p><div className="mt-6 grid grid-cols-4 gap-2 rounded-2xl border border-gray-100 bg-gray-50 p-4 text-center"><div><p className="font-display text-xl font-bold text-navy">{result.summary.recipients}</p><p className="text-[10px] uppercase tracking-wide text-gray-400">Recipients</p></div><div><p className="font-display text-xl font-bold text-emerald-600">{result.summary.sent}</p><p className="text-[10px] uppercase tracking-wide text-gray-400">Sent</p></div><div><p className="font-display text-xl font-bold text-red-500">{result.summary.failed}</p><p className="text-[10px] uppercase tracking-wide text-gray-400">Failed</p></div><div><p className="font-display text-xl font-bold text-gray-500">{result.summary.skipped}</p><p className="text-[10px] uppercase tracking-wide text-gray-400">Skipped</p></div></div><button type="button" onClick={onClose} className="mt-6 rounded-xl bg-gradient-to-r from-primary to-secondary px-6 py-3 text-sm font-semibold text-white">Done</button></div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
