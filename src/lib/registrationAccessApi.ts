export type PaymentState = 'not_submitted' | 'under_review' | 'verified' | 'rejected'

export interface RegistrationAccessItem {
  registrationId: string
  fullName: string
  email: string
  fee: number
  feeLabel: string
  paymentOption: 'pay_now' | 'pay_later'
  status: 'pending' | 'verified' | 'rejected'
  createdAt: string
  paymentState: PaymentState
  canUploadPaymentProof: boolean
}

interface ApiFailure {
  success?: false
  message?: string
  paymentState?: PaymentState
}

export class RegistrationAccessApiError extends Error {
  status: number
  paymentState?: PaymentState

  constructor(status: number, response?: ApiFailure) {
    super(response?.message || 'Something went wrong. Please try again.')
    this.name = 'RegistrationAccessApiError'
    this.status = status
    this.paymentState = response?.paymentState
  }
}

async function request<T>(url: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    credentials: 'include',
    ...init,
  })

  const body = await response.json().catch(() => null)
  if (!response.ok || !body?.success) {
    throw new RegistrationAccessApiError(response.status, body || undefined)
  }

  return body as T
}

export function requestRegistrationOtp(email: string) {
  return request<{ success: true; message: string }>('/api/registration-access/otp/request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
}

export function verifyRegistrationOtp(email: string, code: string) {
  return request<{ success: true; message: string; expiresAt: string }>('/api/registration-access/otp/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
  })
}

export function getAttendeeRegistrations() {
  return request<{ success: true; items: RegistrationAccessItem[] }>('/api/registration-access/registrations')
}

export function logoutAttendeeRegistrationAccess() {
  return request<{ success: true; message: string }>('/api/registration-access/logout', {
    method: 'POST',
  })
}

export function uploadPaymentProof(registrationId: string, file: File) {
  const formData = new FormData()
  formData.append('paymentScreenshot', file)

  return request<{
    success: true
    message: string
    item: RegistrationAccessItem
    warning?: string
  }>(`/api/registration-access/registrations/${encodeURIComponent(registrationId)}/payment-proof`, {
    method: 'POST',
    body: formData,
  })
}
