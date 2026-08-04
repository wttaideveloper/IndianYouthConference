const TOKEN_KEY = 'iyc_admin_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export function isLoggedIn() {
  return Boolean(getToken())
}

async function adminFetch(path: string, options: RequestInit = {}) {
  const token = getToken()
  const headers = new Headers(options.headers)
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  const res = await fetch(path, { ...options, headers })
  const data = await res.json().catch(() => ({}))

  if (res.status === 401) {
    clearToken()
    throw new Error(data.message || 'Session expired')
  }

  if (!res.ok) throw new Error(data.message || 'Request failed')
  return data
}

export async function login(username: string, password: string) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Login failed')
  setToken(data.token)
  return data
}

export interface RegistrationFilters {
  page?: number
  limit?: number
  search?: string
  status?: string
  paymentStatus?: string
  gender?: string
  occupation?: string
  programPreference?: string
  howDidYouKnow?: string
  pastAttendance?: string
  sectionConference?: string
  from?: string
  to?: string
}

export type AdminEmailAudience = 'all' | 'verified' | 'payment_under_review' | 'pay_later_unpaid' | 'individual'

export interface AdminEmailAudienceRequest {
  audience: AdminEmailAudience
  registrationId?: string
}

export interface AdminEmailPreview {
  success: true
  audience: AdminEmailAudience
  recipientCount: number
  skippedInvalidEmails: number
  duplicateEmailsSkipped: number
}

export interface AdminEmailCampaignSummary {
  recipients: number
  sent: number
  failed: number
  skipped: number
}

export interface AdminEmailCampaignResponse {
  success: true
  audience: AdminEmailAudience
  summary: AdminEmailCampaignSummary
  individual?: {
    registrationId: string
    delivery: 'sent' | 'failed' | 'skipped'
  }
}

export interface Registration {
  _id: string
  firstName: string
  lastName: string
  fullName: string
  gender: string
  phone: string
  email: string
  streetAddress: string
  streetAddress2?: string
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
  fee: number
  feeLabel: string
  paymentOption?: 'pay_now' | 'pay_later'
  status: 'pending' | 'verified' | 'rejected'
  adminNotes?: string
  emailSent?: boolean
  verificationEmailSent?: boolean
  rejectionEmailSent?: boolean
  createdAt: string
  paymentScreenshot?: {
    filename?: string
    originalname?: string
    mimetype?: string
    hasFile?: boolean
  }
}

export function paymentStatusLabel(status: string, hasScreenshot: boolean) {
  if (status === 'verified') return 'Paid / Verified'
  if (status === 'rejected') return 'Payment Rejected'
  return hasScreenshot ? 'Payment Under Review' : 'Payment Pending'
}

function toQuery(filters: RegistrationFilters) {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') params.set(key, String(value))
  })
  return params.toString()
}

export async function fetchStats() {
  return adminFetch('/api/admin/stats')
}

export function previewAdminEmailAudience(request: AdminEmailAudienceRequest) {
  return adminFetch('/api/admin/emails/preview', {
    method: 'POST',
    body: JSON.stringify(request),
  }) as Promise<AdminEmailPreview>
}

export function sendAdminEmailCampaign({
  audience,
  registrationId,
  subject,
  message,
  idempotencyKey,
}: AdminEmailAudienceRequest & {
  subject: string
  message: string
  idempotencyKey: string
}) {
  return adminFetch('/api/admin/emails/send', {
    method: 'POST',
    headers: { 'Idempotency-Key': idempotencyKey },
    body: JSON.stringify({ audience, ...(registrationId && { registrationId }), subject, message }),
  }) as Promise<AdminEmailCampaignResponse>
}

export async function fetchRegistrations(filters: RegistrationFilters = {}) {
  const qs = toQuery(filters)
  return adminFetch(`/api/admin/registrations?${qs}`)
}

export async function fetchRegistration(id: string) {
  return adminFetch(`/api/admin/registrations/${id}`)
}

export type RegistrationUpdate = Partial<
  Omit<Registration, '_id' | 'createdAt' | 'fullName' | 'fee' | 'feeLabel' | 'paymentScreenshot' | 'emailSent'>
>

export async function updateRegistration(id: string, updates: RegistrationUpdate) {
  return adminFetch(`/api/admin/registrations/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  })
}

export async function deleteRegistration(id: string) {
  return adminFetch(`/api/admin/registrations/${id}`, { method: 'DELETE' })
}

export function screenshotUrl(id: string) {
  return `/api/admin/registrations/${id}/screenshot`
}

export async function exportCsv(filters: RegistrationFilters = {}) {
  const token = getToken()
  const qs = toQuery(filters)
  const res = await fetch(`/api/admin/registrations/export?${qs}`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.message || 'Export failed')
  }

  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `iyc-registrations-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
