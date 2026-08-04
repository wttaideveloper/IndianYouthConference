import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Loader2, Save, ImageIcon, MapPin, Calendar,
  Phone, Mail, CheckCircle, Clock, XCircle, ZoomIn, Pencil, Trash2, AlertTriangle,
} from 'lucide-react'
import {
  fetchRegistration,
  updateRegistration,
  deleteRegistration,
  screenshotUrl,
  getToken,
  type Registration,
  type RegistrationUpdate,
} from '../../lib/adminApi'
import {
  OCCUPATIONS, GENDERS, PROGRAM_PREFERENCES, HOW_DID_YOU_KNOW, PAST_ATTENDANCE, calculateFee,
} from '../../data/registration'

interface Props {
  id: string | null
  startEditing?: boolean
  onClose: () => void
  onUpdated: () => void
  onSendEmail?: (registrationId: string) => void
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', icon: Clock, color: 'border-amber-300 bg-amber-50 text-amber-700', active: 'ring-amber-400 bg-amber-100' },
  { value: 'verified', label: 'Verified', icon: CheckCircle, color: 'border-emerald-300 bg-emerald-50 text-emerald-700', active: 'ring-emerald-400 bg-emerald-100' },
  { value: 'rejected', label: 'Rejected', icon: XCircle, color: 'border-red-300 bg-red-50 text-red-700', active: 'ring-red-400 bg-red-100' },
]

type FormState = RegistrationUpdate & { status: string }

function itemToForm(item: Registration): FormState {
  return {
    firstName: item.firstName,
    lastName: item.lastName,
    gender: item.gender,
    phone: item.phone,
    email: item.email,
    streetAddress: item.streetAddress,
    streetAddress2: item.streetAddress2 || '',
    city: item.city,
    state: item.state,
    postalCode: item.postalCode,
    sectionConference: item.sectionConference,
    occupation: item.occupation,
    arrivalDate: item.arrivalDate,
    departureDate: item.departureDate,
    programPreference: item.programPreference,
    howDidYouKnow: item.howDidYouKnow,
    pastAttendance: item.pastAttendance,
    emergencyContactName: item.emergencyContactName,
    emergencyContactNumber: item.emergencyContactNumber,
    status: item.status,
    adminNotes: item.adminNotes || '',
  }
}

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1 block">{label}</label>
      {children}
    </div>
  )
}

const inputCls = 'w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20'

export default function RegistrationModal({ id, startEditing = false, onClose, onUpdated, onSendEmail }: Props) {
  const [item, setItem] = useState<Registration | null>(null)
  const [form, setForm] = useState<FormState | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageZoom, setImageZoom] = useState(false)

  const hasScreenshot = Boolean(item?.paymentScreenshot?.filename)

  const feePreview = useMemo(() => {
    if (!form?.occupation) return null
    return calculateFee(form.occupation, form.programPreference || '')
  }, [form?.occupation, form?.programPreference])

  const updateForm = (key: keyof FormState, value: string) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev))
  }

  useEffect(() => {
    if (!id) return
    let blobUrl: string | null = null

    setLoading(true)
    setError('')
    setImageUrl(null)
    setImageZoom(false)
    setIsEditing(startEditing)
    setShowDeleteConfirm(false)

    fetchRegistration(id)
      .then(async (data) => {
        setItem(data.item)
        setForm(itemToForm(data.item))
        if (startEditing) setIsEditing(true)

        if (data.item.paymentScreenshot?.hasFile) {
          const token = getToken()
          const res = await fetch(screenshotUrl(id), {
            headers: { Authorization: `Bearer ${token}` },
          })
          if (res.ok) {
            blobUrl = URL.createObjectURL(await res.blob())
            setImageUrl(blobUrl)
          }
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))

    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl)
    }
  }, [id, startEditing])

  const handleSave = async () => {
    if (!id || !form) return
    setSaving(true)
    setError('')
    try {
      const data = await updateRegistration(id, form)
      setItem(data.item)
      setForm(itemToForm(data.item))
      setIsEditing(false)
      onUpdated()
      onClose()
      if (data.warning) {
        window.alert(data.warning)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!id) return
    setDeleting(true)
    setError('')
    try {
      await deleteRegistration(id)
      onUpdated()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
      setShowDeleteConfirm(false)
    } finally {
      setDeleting(false)
    }
  }

  const cancelEdit = () => {
    if (item) setForm(itemToForm(item))
    setIsEditing(false)
    setError('')
  }

  return (
    <AnimatePresence>
      {id && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-navy/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed inset-x-4 bottom-0 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-[101] w-auto sm:w-full sm:max-w-3xl max-h-[92vh] sm:max-h-[88vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-gradient-to-r from-navy to-navy-mid px-6 py-5 shrink-0">
              <div className="absolute top-4 right-4 flex items-center gap-2">
                {!loading && item && !isEditing && (
                  <>
                    {onSendEmail && (
                      <button
                        type="button"
                        onClick={() => onSendEmail(item._id)}
                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                        title="Send email"
                        aria-label="Send email to this attendee"
                      >
                        <Mail size={14} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                      title="Edit registration"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="w-8 h-8 rounded-full bg-red-500/20 hover:bg-red-500/40 text-red-200 flex items-center justify-center transition-colors"
                      title="Delete registration"
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-4 w-40 bg-white/10 rounded animate-pulse" />
                    <div className="h-3 w-24 bg-white/10 rounded animate-pulse" />
                  </div>
                </div>
              ) : item && (
                <div className="flex items-center gap-4 pr-24">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    {getInitials(`${form?.firstName || ''} ${form?.lastName || ''}`.trim() || item.fullName)}
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-white text-lg leading-tight">
                      {isEditing ? 'Edit Registration' : item.fullName}
                    </h2>
                    <p className="text-white/50 text-sm">
                      {isEditing ? item.fullName : `${item.occupation} · ₹${item.fee}`}
                      {isEditing && feePreview && ` · ₹${feePreview.fee} (preview)`}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading && (
                <div className="flex justify-center py-20">
                  <Loader2 className="animate-spin text-primary" size={32} />
                </div>
              )}

              {error && !loading && (
                <div className="m-6 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</div>
              )}

              {showDeleteConfirm && (
                <div className="m-6 p-5 rounded-2xl border-2 border-red-200 bg-red-50">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={20} />
                    <div className="flex-1">
                      <p className="font-semibold text-red-800 mb-1">Delete this registration?</p>
                      <p className="text-sm text-red-600 mb-4">
                        This will permanently remove <strong>{item?.fullName}</strong> and their payment screenshot. This cannot be undone.
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setShowDeleteConfirm(false)}
                          className="px-4 py-2 rounded-xl border border-red-200 text-sm text-red-700 hover:bg-white transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleDelete}
                          disabled={deleting}
                          className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center gap-2"
                        >
                          {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                          Delete permanently
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {item && form && !loading && isEditing && (
                <div className="p-6 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="First Name">
                      <input className={inputCls} value={form.firstName} onChange={(e) => updateForm('firstName', e.target.value)} />
                    </Field>
                    <Field label="Last Name">
                      <input className={inputCls} value={form.lastName} onChange={(e) => updateForm('lastName', e.target.value)} />
                    </Field>
                    <Field label="Gender">
                      <select className={inputCls} value={form.gender} onChange={(e) => updateForm('gender', e.target.value)}>
                        {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </Field>
                    <Field label="Phone">
                      <input className={inputCls} value={form.phone} onChange={(e) => updateForm('phone', e.target.value)} />
                    </Field>
                    <Field label="Email">
                      <input type="email" className={inputCls} value={form.email} onChange={(e) => updateForm('email', e.target.value)} />
                    </Field>
                    <Field label="Occupation">
                      <select className={inputCls} value={form.occupation} onChange={(e) => updateForm('occupation', e.target.value)}>
                        {OCCUPATIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </Field>
                    <Field label="Street Address">
                      <input className={inputCls} value={form.streetAddress} onChange={(e) => updateForm('streetAddress', e.target.value)} />
                    </Field>
                    <Field label="Address Line 2">
                      <input className={inputCls} value={form.streetAddress2} onChange={(e) => updateForm('streetAddress2', e.target.value)} />
                    </Field>
                    <Field label="City">
                      <input className={inputCls} value={form.city} onChange={(e) => updateForm('city', e.target.value)} />
                    </Field>
                    <Field label="State">
                      <input className={inputCls} value={form.state} onChange={(e) => updateForm('state', e.target.value)} />
                    </Field>
                    <Field label="Postal Code">
                      <input className={inputCls} value={form.postalCode} onChange={(e) => updateForm('postalCode', e.target.value)} />
                    </Field>
                    <Field label="Section / Conference">
                      <input className={inputCls} value={form.sectionConference} onChange={(e) => updateForm('sectionConference', e.target.value)} />
                    </Field>
                    <Field label="Arrival Date">
                      <input type="date" className={inputCls} value={form.arrivalDate} onChange={(e) => updateForm('arrivalDate', e.target.value)} />
                    </Field>
                    <Field label="Departure Date">
                      <input type="date" className={inputCls} value={form.departureDate} onChange={(e) => updateForm('departureDate', e.target.value)} />
                    </Field>
                    <Field label="Program Preference">
                      <select className={inputCls} value={form.programPreference} onChange={(e) => updateForm('programPreference', e.target.value)}>
                        {PROGRAM_PREFERENCES.map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </Field>
                    <Field label="How did you know IYC">
                      <select className={inputCls} value={form.howDidYouKnow} onChange={(e) => updateForm('howDidYouKnow', e.target.value)}>
                        {HOW_DID_YOU_KNOW.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </Field>
                    <Field label="Attended Before">
                      <select className={inputCls} value={form.pastAttendance} onChange={(e) => updateForm('pastAttendance', e.target.value)}>
                        {PAST_ATTENDANCE.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </Field>
                    <Field label="Emergency Contact Name">
                      <input className={inputCls} value={form.emergencyContactName} onChange={(e) => updateForm('emergencyContactName', e.target.value)} />
                    </Field>
                    <Field label="Emergency Contact Number">
                      <input className={inputCls} value={form.emergencyContactNumber} onChange={(e) => updateForm('emergencyContactNumber', e.target.value)} />
                    </Field>
                  </div>

                  {feePreview && (
                    <p className="text-sm text-primary font-medium bg-primary/5 rounded-xl px-4 py-2.5">
                      Updated fee: ₹{feePreview.fee} ({feePreview.label})
                    </p>
                  )}

                  <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-5 space-y-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Payment Status</p>
                    <div className="grid grid-cols-3 gap-2">
                      {STATUS_OPTIONS.map(({ value, label, icon: Icon, color, active }) => {
                        const locked = !hasScreenshot && value === 'verified'
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => updateForm('status', value)}
                            disabled={locked}
                            title={locked ? 'Cannot verify until a payment screenshot is uploaded' : label}
                            className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 text-xs font-semibold transition-all ${
                              locked
                                ? 'opacity-40 cursor-not-allowed'
                                : form.status === value
                                  ? `${active} ring-2`
                                  : `${color} opacity-70 hover:opacity-100`
                            }`}
                          >
                            <Icon size={18} />
                            {label}
                          </button>
                        )
                      })}
                    </div>
                    {!hasScreenshot && (
                      <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 flex items-center gap-1.5">
                        <AlertTriangle size={13} className="shrink-0" />
                        Cannot verify until a payment screenshot is uploaded.
                      </p>
                    )}
                    <Field label="Admin Notes">
                      <textarea
                        value={form.adminNotes}
                        onChange={(e) => updateForm('adminNotes', e.target.value)}
                        rows={2}
                        className={`${inputCls} resize-none`}
                      />
                    </Field>
                  </div>
                </div>
              )}

              {item && form && !loading && !isEditing && (
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50/80">
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-sm text-primary"><Mail size={14} /></div>
                      <div><p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Email</p><p className="text-sm text-navy font-medium">{item.email}</p></div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50/80">
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-sm text-primary"><Phone size={14} /></div>
                      <div><p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Phone</p><p className="text-sm text-navy font-medium">{item.phone}</p></div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50/80 sm:col-span-2">
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-sm text-secondary"><MapPin size={14} /></div>
                      <div><p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Address</p><p className="text-sm text-navy font-medium">{item.streetAddress}{item.streetAddress2 ? `, ${item.streetAddress2}` : ''}, {item.city}, {item.state} {item.postalCode}</p></div>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Conference Details</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {[
                        ['Section', item.sectionConference],
                        ['Occupation', item.occupation],
                        ['Fee', `₹${item.fee} (${item.feeLabel})`],
                        ['Arrival', item.arrivalDate],
                        ['Departure', item.departureDate],
                        ['Program', item.programPreference],
                        ['Referral', item.howDidYouKnow],
                        ['Attended Before', item.pastAttendance],
                        ['Emergency', `${item.emergencyContactName} — ${item.emergencyContactNumber}`],
                      ].map(([label, value]) => (
                        <div key={label} className="p-3 rounded-xl border border-gray-100 bg-white">
                          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
                          <p className="text-sm text-navy font-medium break-words">{value}</p>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-3 flex items-center gap-1.5">
                      <Calendar size={12} /> Submitted {new Date(item.createdAt).toLocaleString('en-IN')}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <ImageIcon size={13} /> Payment Screenshot
                    </p>
                    {imageUrl ? (
                      <button type="button" onClick={() => setImageZoom(true)} className="relative w-full rounded-2xl border border-gray-200 overflow-hidden bg-gray-50 group">
                        <img src={imageUrl} alt="Payment" className="w-full max-h-56 object-contain" />
                        <div className="absolute inset-0 bg-navy/0 group-hover:bg-navy/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <span className="flex items-center gap-1.5 text-white text-sm font-medium bg-black/50 px-3 py-1.5 rounded-full">
                            <ZoomIn size={14} /> View full size
                          </span>
                        </div>
                      </button>
                    ) : (
                      <div className="rounded-2xl border-2 border-dashed border-gray-200 p-10 text-center text-gray-400 text-sm">No payment screenshot</div>
                    )}
                  </div>

                  <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-5 space-y-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Payment Status</p>
                    <div className="grid grid-cols-3 gap-2">
                      {STATUS_OPTIONS.map(({ value, label, icon: Icon, color, active }) => {
                        const locked = !hasScreenshot && value === 'verified'
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => updateForm('status', value)}
                            disabled={locked}
                            title={locked ? 'Cannot verify until a payment screenshot is uploaded' : label}
                            className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 text-xs font-semibold transition-all ${
                              locked
                                ? 'opacity-40 cursor-not-allowed'
                                : form.status === value
                                  ? `${active} ring-2`
                                  : `${color} opacity-70 hover:opacity-100`
                            }`}
                          >
                            <Icon size={18} />
                            {label}
                          </button>
                        )
                      })}
                    </div>
                    {!hasScreenshot && (
                      <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 flex items-center gap-1.5">
                        <AlertTriangle size={13} className="shrink-0" />
                        Cannot verify until a payment screenshot is uploaded.
                      </p>
                    )}
                    <Field label="Admin Notes">
                      <textarea
                        value={form.adminNotes}
                        onChange={(e) => updateForm('adminNotes', e.target.value)}
                        rows={2}
                        className={`${inputCls} resize-none`}
                        placeholder="Add a note..."
                      />
                    </Field>
                  </div>
                </div>
              )}
            </div>

            {item && form && !loading && !showDeleteConfirm && (
              <div className="shrink-0 border-t border-gray-100 px-6 py-4 flex gap-3 bg-white">
                {isEditing ? (
                  <>
                    <button type="button" onClick={cancelEdit} className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                      Cancel
                    </button>
                    <button type="button" onClick={handleSave} disabled={saving} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-md disabled:opacity-60">
                      {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                      Save Changes
                    </button>
                  </>
                ) : (
                  <>
                    <button type="button" onClick={() => setIsEditing(true)} className="py-3 px-4 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2">
                      <Pencil size={15} /> Edit
                    </button>
                    <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                      Close
                    </button>
                    <button type="button" onClick={handleSave} disabled={saving} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-md disabled:opacity-60">
                      {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                      Save Status
                    </button>
                  </>
                )}
              </div>
            )}
          </motion.div>

          {imageZoom && imageUrl && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4" onClick={() => setImageZoom(false)}>
              <button type="button" onClick={() => setImageZoom(false)} className="absolute top-4 right-4 text-white/70 hover:text-white p-2"><X size={24} /></button>
              <img src={imageUrl} alt="Payment full size" className="max-w-full max-h-full object-contain rounded-lg" />
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  )
}
