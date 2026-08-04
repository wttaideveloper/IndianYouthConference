/**
 * Derived payment "state" shown to an attendee for a registration.
 *
 * pending + no screenshot  = not_submitted
 * pending + screenshot     = under_review
 * verified                 = verified
 * rejected                 = rejected
 */
export function paymentState(reg) {
  const status = reg?.status
  if (status === 'verified') return 'verified'
  if (status === 'rejected') return 'rejected'
  if (status === 'pending') {
    const hasScreenshot = Boolean(reg?.paymentScreenshot?.filename || reg?.paymentScreenshot?.path)
    return hasScreenshot ? 'under_review' : 'not_submitted'
  }
  return 'not_submitted'
}

/** An attendee may upload/replace payment proof only while not_submitted or rejected. */
export function canUploadPaymentProof(state) {
  return state === 'not_submitted' || state === 'rejected'
}