import nodemailer from 'nodemailer'
import { getEventDetails } from './lib/eventDetails.js'

let transporter = null

const CONTACT_EMAIL = process.env.FROM_EMAIL || process.env.SMTP_USER || 'info@indianyouthconference.com'

function positiveInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

function isPlaceholderValue(value) {
  const normalized = String(value || '').trim().toLowerCase()
  return !normalized || /^(your_|change_me|replace_|example|placeholder)/.test(normalized)
}

export function isEmailServiceConfigured() {
  const { SMTP_HOST, SMTP_USER, SMTP_PASS } = process.env
  return !isPlaceholderValue(SMTP_HOST) &&
    !isPlaceholderValue(SMTP_USER) &&
    !isPlaceholderValue(SMTP_PASS)
}

function getTransporter() {
  if (transporter) return transporter

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env

  if (!isEmailServiceConfigured()) {
    return null
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    connectionTimeout: positiveInteger(process.env.SMTP_CONNECTION_TIMEOUT_MS, 10_000),
    greetingTimeout: positiveInteger(process.env.SMTP_GREETING_TIMEOUT_MS, 10_000),
    socketTimeout: positiveInteger(process.env.SMTP_SOCKET_TIMEOUT_MS, 15_000),
  })

  return transporter
}

function formatRegistrationHtml(data) {
  const isPayLater = data.paymentOption === 'pay_later'
  const intro = isPayLater
    ? 'A new registration has been submitted with <strong>Pay Later</strong>. No payment screenshot is attached — please follow up with the registrant for payment.'
    : 'A new registration has been submitted. Please review the payment screenshot in the admin portal and verify the registration.'
  const rows = [
    ['Full Name', data.fullName],
    ['Gender', data.gender],
    ['Phone', data.phone],
    ['Email', data.email],
    ['Street Address', data.streetAddress],
    ['Address Line 2', data.streetAddress2 || '—'],
    ['City', data.city],
    ['State', data.state],
    ['Postal Code', data.postalCode],
    ['Section / Conference', data.sectionConference],
    ['Occupation', data.occupation],
    ['Registration Fee', `₹${data.fee} (${data.feeLabel})`],
    ['Payment Option', isPayLater ? 'Pay Later' : 'Pay Now'],
    ['Arrival Date', data.arrivalDate],
    ['Departure Date', data.departureDate],
    ['Program Preference', data.programPreference],
    ['How did you know IYC', data.howDidYouKnow],
    ['Attended IYC before', data.pastAttendance],
    ['Emergency Contact', data.emergencyContactName],
    ['Emergency Number', data.emergencyContactNumber],
    ['Payment Screenshot', isPayLater ? 'Not provided (Pay Later)' : 'Attached to this email'],
    ['Submitted At', new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })],
  ]

  const tableRows = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:10px 14px;border-bottom:1px solid #eee;font-weight:600;color:#0b0e37;width:200px;">${label}</td><td style="padding:10px 14px;border-bottom:1px solid #eee;color:#4a5568;">${value}</td></tr>`,
    )
    .join('')

  return `
    <div style="font-family:Inter,Arial,sans-serif;max-width:640px;margin:0 auto;">
      <div style="background:linear-gradient(135deg,#0b0e37,#e1137b);padding:28px;border-radius:12px 12px 0 0;">
        <h1 style="color:#fff;margin:0;font-size:22px;">New IYC 2026 Registration</h1>
        <p style="color:#ffc107;margin:8px 0 0;font-size:14px;">Indian Youth Conference — Mount Zion Campus, Pudukkottai</p>
      </div>
      <div style="background:#fff;padding:24px;border:1px solid #eee;border-top:none;border-radius:0 0 12px 12px;">
        <p style="color:#4a5568;line-height:1.6;margin-top:0;">${intro}</p>
        <table style="width:100%;border-collapse:collapse;">${tableRows}</table>
      </div>
    </div>
  `
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function formatAttendeeEventDetails(event) {
  const t = event.travel
  const travelBox = t ? `
      <div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:10px;padding:14px;margin:14px 0 0;color:#4a5568;font-size:13px;line-height:1.6;">
        <p style="margin:0 0 8px;font-weight:700;color:#92400e;">${escapeHtml(t.heading)}</p>
        ${t.nearestAirport ? `<p style="margin:0 0 6px;"><strong>Nearest Airport:</strong> ${escapeHtml(t.nearestAirport)}</p>` : ''}
        ${t.railwayStation ? `<p style="margin:0 0 6px;"><strong>Railway:</strong> ${escapeHtml(t.railwayStation)}</p>` : ''}
        ${t.busStand ? `<p style="margin:0 0 6px;"><strong>Bus:</strong> ${escapeHtml(t.busStand)}</p>` : ''}
        ${t.localTransport ? `<p style="margin:0;"><strong>Local Transport:</strong> ${escapeHtml(t.localTransport)}</p>` : ''}
      </div>
  ` : ''
  return `
    <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:16px;margin:20px 0;color:#4a5568;font-size:14px;line-height:1.6;">
      <p style="margin:0 0 6px;"><strong style="color:#0b0e37;">${escapeHtml(event.name)}</strong></p>
      <p style="margin:0 0 6px;"><strong>Dates:</strong> ${escapeHtml(event.dates)}</p>
      <p style="margin:0 0 6px;"><strong>Venue:</strong> ${escapeHtml(event.venue)}<br>${escapeHtml(event.address)}</p>
      <p style="margin:0;"><strong>Contact:</strong> <a href="mailto:${escapeHtml(event.contactEmail)}" style="color:#e1137b;">${escapeHtml(event.contactEmail)}</a> &middot; ${escapeHtml(event.contactPhone)}</p>
      ${travelBox}
    </div>
  `
}

function formatAttendeeEmail({ heading, body }) {
  const event = getEventDetails()
  return `
    <div style="font-family:Inter,Arial,sans-serif;max-width:640px;margin:0 auto;">
      <div style="background:linear-gradient(135deg,#0b0e37,#e1137b);padding:28px;border-radius:12px 12px 0 0;">
        <h1 style="color:#fff;margin:0;font-size:22px;">${escapeHtml(heading)}</h1>
        <p style="color:#ffc107;margin:8px 0 0;font-size:14px;">${escapeHtml(event.name)}</p>
      </div>
      <div style="background:#fff;padding:24px;border:1px solid #eee;border-top:none;border-radius:0 0 12px 12px;color:#4a5568;line-height:1.6;">
        ${body}
        ${formatAttendeeEventDetails(event)}
        <p style="margin:24px 0 0;color:#4a5568;">Warm regards,<br><strong>IYC Team</strong></p>
      </div>
    </div>
  `
}

function paymentOptionLabel(paymentOption) {
  return paymentOption === 'pay_later' ? 'Pay Later' : 'Pay Now'
}

function formatRegistrationConfirmationHtml(data) {
  const rows = [
    ['Registrant', data.fullName],
    ['Registration category', data.feeLabel],
    ['Registration fee', `₹${data.fee}`],
    ['Payment option', paymentOptionLabel(data.paymentOption)],
  ]
    .map(([label, value]) => `<tr><td style="padding:9px 12px;border-bottom:1px solid #eee;font-weight:600;color:#0b0e37;">${escapeHtml(label)}</td><td style="padding:9px 12px;border-bottom:1px solid #eee;">${escapeHtml(value)}</td></tr>`)
    .join('')

  return formatAttendeeEmail({
    heading: 'Registration Received',
    body: `
      <p style="margin-top:0;">Dear <strong>${escapeHtml(data.fullName)}</strong>,</p>
      <p>Thank you for registering. We have successfully received your registration.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">${rows}</table>
      <p>Please keep this email for your records.</p>
    `,
  })
}

function formatPaymentReceivedHtml(data) {
  return formatAttendeeEmail({
    heading: 'Payment Received',
    body: `
      <p style="margin-top:0;">Dear <strong>${escapeHtml(data.fullName)}</strong>,</p>
      <p>Thank you. Your registration has been received, and we have successfully received your payment proof.</p>
      <p>Our team will verify your payment shortly. You will receive another email once your registration has been verified.</p>
    `,
  })
}

function formatCompletePaymentHtml(data) {
  return formatAttendeeEmail({
    heading: 'Complete Your Payment',
    body: `
      <p style="margin-top:0;">Dear <strong>${escapeHtml(data.fullName)}</strong>,</p>
      <p>Your registration has been saved successfully.</p>
      <p><strong>Your registration fee:</strong> ₹${escapeHtml(data.fee)}</p>
      <p>Kindly complete your payment before the event begins. You can return to this website anytime and use the <strong>Already Registered</strong> button on the Home page.</p>
      <p>From there you can:</p>
      <ul style="margin:0 0 16px;padding-left:22px;"><li>complete your payment</li><li>upload your payment proof</li></ul>
      <p>Once payment has been verified, your registration will be confirmed.</p>
    `,
  })
}

function formatPaymentProofHtml({ registrationId, fullName, email, previousPaymentState }) {
  const isReplacement = previousPaymentState === 'rejected'
  const submissionNote = isReplacement
    ? 'A replacement payment proof was submitted after rejection.'
    : 'A new payment proof was submitted for review.'

  return `
    <div style="font-family:Inter,Arial,sans-serif;max-width:640px;margin:0 auto;">
      <div style="background:linear-gradient(135deg,#0b0e37,#e1137b);padding:28px;border-radius:12px 12px 0 0;">
        <h1 style="color:#fff;margin:0;font-size:22px;">Payment Proof Submitted</h1>
        <p style="color:#ffc107;margin:8px 0 0;font-size:14px;">Indian Youth Conference 2026</p>
      </div>
      <div style="background:#fff;padding:24px;border:1px solid #eee;border-top:none;border-radius:0 0 12px 12px;">
        <p style="color:#4a5568;line-height:1.6;margin-top:0;">${submissionNote}</p>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:10px 14px;border-bottom:1px solid #eee;font-weight:600;width:180px;">Attendee</td><td style="padding:10px 14px;border-bottom:1px solid #eee;">${escapeHtml(fullName)}</td></tr>
          <tr><td style="padding:10px 14px;border-bottom:1px solid #eee;font-weight:600;">Email</td><td style="padding:10px 14px;border-bottom:1px solid #eee;">${escapeHtml(email)}</td></tr>
          <tr><td style="padding:10px 14px;border-bottom:1px solid #eee;font-weight:600;">Registration ID</td><td style="padding:10px 14px;border-bottom:1px solid #eee;">${escapeHtml(registrationId)}</td></tr>
          <tr><td style="padding:10px 14px;font-weight:600;">Previous payment state</td><td style="padding:10px 14px;">${escapeHtml(previousPaymentState)}</td></tr>
        </table>
        <p style="color:#4a5568;line-height:1.6;margin-bottom:0;">The payment proof is attached to this email.</p>
      </div>
    </div>
  `
}

function formatVerifiedHtml(data) {
  const event = getEventDetails()
  const t = event.travel
  const travelBox = t ? `
        <div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:10px;padding:14px;margin:20px 0;color:#4a5568;font-size:13px;line-height:1.6;">
          <p style="margin:0 0 8px;font-weight:700;color:#92400e;">${escapeHtml(t.heading)}</p>
          ${t.nearestAirport ? `<p style="margin:0 0 6px;"><strong>Nearest Airport:</strong> ${escapeHtml(t.nearestAirport)}</p>` : ''}
          ${t.railwayStation ? `<p style="margin:0 0 6px;"><strong>Railway:</strong> ${escapeHtml(t.railwayStation)}</p>` : ''}
          ${t.busStand ? `<p style="margin:0 0 6px;"><strong>Bus:</strong> ${escapeHtml(t.busStand)}</p>` : ''}
          ${t.localTransport ? `<p style="margin:0;"><strong>Local Transport:</strong> ${escapeHtml(t.localTransport)}</p>` : ''}
        </div>` : ''
  return `
    <div style="font-family:Inter,Arial,sans-serif;max-width:640px;margin:0 auto;">
      <div style="background:linear-gradient(135deg,#0b0e37,#e1137b);padding:28px;border-radius:12px 12px 0 0;">
        <h1 style="color:#fff;margin:0;font-size:22px;">Registration Verified ✓</h1>
        <p style="color:#ffc107;margin:8px 0 0;font-size:14px;">Indian Youth Conference 2026</p>
      </div>
      <div style="background:#fff;padding:24px;border:1px solid #eee;border-top:none;border-radius:0 0 12px 12px;">
        <p style="color:#4a5568;line-height:1.6;">Dear <strong>${data.fullName}</strong>,</p>
        <p style="color:#4a5568;line-height:1.6;">
          Great news! Your registration and payment for the Indian Youth Conference 2026
          (${escapeHtml(event.dates)}) have been <strong>verified</strong> by our team.
        </p>
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:20px 0;">
          <p style="margin:0 0 8px;color:#166534;font-weight:600;">Your confirmed registration:</p>
          <p style="margin:4px 0;color:#4a5568;"><strong>Section:</strong> ${escapeHtml(data.sectionConference)}</p>
          <p style="margin:4px 0;color:#4a5568;"><strong>Fee:</strong> ₹${escapeHtml(data.fee)} (${escapeHtml(data.feeLabel)})</p>
          <p style="margin:4px 0;color:#4a5568;"><strong>Arrival:</strong> ${escapeHtml(data.arrivalDate)}</p>
          <p style="margin:4px 0;color:#4a5568;"><strong>Departure:</strong> ${escapeHtml(data.departureDate)}</p>
          <p style="margin:4px 0;color:#4a5568;"><strong>Program:</strong> ${escapeHtml(data.programPreference)}</p>
        </div>
        <p style="color:#4a5568;line-height:1.6;">
          <strong>Venue:</strong> ${escapeHtml(event.venue)}, ${escapeHtml(event.address)}
        </p>
        ${travelBox}
        <p style="color:#4a5568;line-height:1.6;">
          For questions, reach us at
          <a href="mailto:${CONTACT_EMAIL}" style="color:#e1137b;">${CONTACT_EMAIL}</a>
          or call <strong>${escapeHtml(event.contactPhone)}</strong>.
        </p>
        <p style="color:#4a5568;margin-top:24px;">We look forward to seeing you!<br><strong>IYC Team</strong></p>
      </div>
    </div>
  `
}

function formatRejectedHtml(data) {
  const notes = data.adminNotes?.trim()
    ? `<p style="color:#4a5568;line-height:1.6;"><strong>Note from admin:</strong> ${data.adminNotes}</p>`
    : ''

  return `
    <div style="font-family:Inter,Arial,sans-serif;max-width:640px;margin:0 auto;">
      <div style="background:linear-gradient(135deg,#0b0e37,#e1137b);padding:28px;border-radius:12px 12px 0 0;">
        <h1 style="color:#fff;margin:0;font-size:22px;">Registration Update</h1>
        <p style="color:#ffc107;margin:8px 0 0;font-size:14px;">Indian Youth Conference 2026</p>
      </div>
      <div style="background:#fff;padding:24px;border:1px solid #eee;border-top:none;border-radius:0 0 12px 12px;">
        <p style="color:#4a5568;line-height:1.6;">Dear <strong>${data.fullName}</strong>,</p>
        <p style="color:#4a5568;line-height:1.6;">
          We reviewed your registration for the Indian Youth Conference 2026, but we were unable to
          verify your payment at this time.
        </p>
        ${notes}
        <p style="color:#4a5568;line-height:1.6;">
          Please contact us at
          <a href="mailto:${CONTACT_EMAIL}" style="color:#e1137b;">${CONTACT_EMAIL}</a>
          or call <strong>+91 8123941065</strong> so we can help resolve this.
        </p>
        <p style="color:#4a5568;margin-top:24px;">God bless,<br><strong>IYC Team</strong></p>
      </div>
    </div>
  `
}

async function sendMail({ to, subject, html, text, replyTo, attachments = [] }) {
  const transport = getTransporter()
  if (!transport) {
    throw new Error('Email is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS in .env')
  }

  const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_USER

  await transport.sendMail({
    from: `"Indian Youth Conference" <${fromEmail}>`,
    to,
    replyTo,
    subject,
    html,
    text,
    attachments,
  })
}

function adminMessageValues({ fullName, fee, status, paymentOption }, forSubject = false) {
  const normalize = (value) => {
    const stringValue = String(value ?? '')
    return forSubject ? stringValue.replace(/[\r\n]+/g, ' ') : stringValue
  }
  const normalizedName = normalize(fullName)

  return {
    fullName: normalizedName,
    firstName: normalizedName.trim().split(/\s+/)[0] || '',
    fee: normalize(`₹${fee ?? ''}`),
    status: normalize(status),
    paymentOption: normalize(paymentOption),
  }
}

function replaceAdminMessagePlaceholders(template, data, forSubject = false) {
  const values = adminMessageValues(data, forSubject)
  return String(template).replace(/\{\{\s*(fullName|firstName|fee|status|paymentOption)\s*\}\}/g, (_match, key) => values[key])
}

function formatAdminComposedHtml(message, data) {
  const renderedMessage = replaceAdminMessagePlaceholders(message, data)
  return `
    <div style="font-family:Inter,Arial,sans-serif;max-width:640px;margin:0 auto;">
      <div style="background:linear-gradient(135deg,#0b0e37,#e1137b);padding:28px;border-radius:12px 12px 0 0;">
        <h1 style="color:#fff;margin:0;font-size:22px;">Indian Youth Conference 2026</h1>
      </div>
      <div style="background:#fff;padding:24px;border:1px solid #eee;border-top:none;border-radius:0 0 12px 12px;color:#4a5568;line-height:1.6;">
        ${escapeHtml(renderedMessage).replace(/\r\n|\r|\n/g, '<br>')}
      </div>
    </div>
  `
}

/** Send a plain-text admin-composed message to one attendee. */
export async function sendAdminComposedEmail({
  to,
  subject,
  message,
  fullName,
  fee,
  status,
  paymentOption,
}) {
  const data = { fullName, fee, status, paymentOption }
  const renderedSubject = replaceAdminMessagePlaceholders(subject, data, true)
  const renderedMessage = replaceAdminMessagePlaceholders(message, data)

  await sendMail({
    to,
    subject: renderedSubject,
    text: renderedMessage,
    html: formatAdminComposedHtml(message, data),
  })
}

/** Confirm that an attendee's registration was received, regardless of payment option. */
export async function sendRegistrationConfirmationEmail(data) {
  await sendMail({
    to: data.email,
    subject: 'Registration Received – Indian Youth Conference 2026',
    html: formatRegistrationConfirmationHtml(data),
  })
}

/** Confirm receipt of a Pay Now attendee's uploaded payment proof. */
export async function sendPaymentReceivedEmail(data) {
  await sendMail({
    to: data.email,
    subject: 'Payment Received – Awaiting Verification',
    html: formatPaymentReceivedHtml(data),
  })
}

/** Guide a Pay Later attendee back to payment and proof submission. */
export async function sendCompletePaymentEmail(data) {
  await sendMail({
    to: data.email,
    subject: 'Complete Your Payment – Indian Youth Conference 2026',
    html: formatCompletePaymentHtml(data),
  })
}

/** Notify admin when a new registration is submitted */
export async function sendAdminRegistrationNotification(data) {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER

  const attachments = data.paymentScreenshot
    ? [{
        filename: data.paymentScreenshot.originalname || data.paymentScreenshot.filename,
        path: data.paymentScreenshot.path,
        contentType: data.paymentScreenshot.mimetype,
      }]
    : []

  const isPayLater = data.paymentOption === 'pay_later'
  const subject = `[IYC] New Registration: ${data.fullName} — ₹${data.fee}${isPayLater ? ' (Pay Later)' : ''}`

  await sendMail({
    to: adminEmail,
    replyTo: data.email,
    subject,
    html: formatRegistrationHtml(data),
    attachments,
  })
}

/** Notify admin when an attendee submits or replaces payment proof. */
export async function sendAdminPaymentProofNotification({
  registrationId,
  fullName,
  email,
  previousPaymentState,
  paymentScreenshot,
}) {
  if (!paymentScreenshot?.path) {
    throw new Error('Payment proof attachment is required')
  }

  const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER
  await sendMail({
    to: adminEmail,
    replyTo: email,
    subject: 'IYC 2026 — Payment Proof Submitted',
    html: formatPaymentProofHtml({ registrationId, fullName, email, previousPaymentState }),
    attachments: [{
      filename: paymentScreenshot.filename,
      path: paymentScreenshot.path,
      contentType: paymentScreenshot.mimetype,
    }],
  })
}

/** Notify registrant after admin verifies payment */
export async function sendUserVerifiedEmail(data) {
  await sendMail({
    to: data.email,
    subject: 'IYC 2026 — Registration Verified ✓',
    html: formatVerifiedHtml(data),
  })
}

/** Notify registrant if admin rejects payment */
export async function sendUserRejectedEmail(data) {
  await sendMail({
    to: data.email,
    subject: 'IYC 2026 — Registration Update',
    html: formatRejectedHtml(data),
  })
}

function formatOtpHtml(otp, { fullName, expiresAt }) {
  return `
    <div style="font-family:Inter,Arial,sans-serif;max-width:640px;margin:0 auto;">
      <div style="background:linear-gradient(135deg,#0b0e37,#e1137b);padding:28px;border-radius:12px 12px 0 0;">
        <h1 style="color:#fff;margin:0;font-size:22px;">Your Registration Access Code</h1>
        <p style="color:#ffc107;margin:8px 0 0;font-size:14px;">Indian Youth Conference 2026</p>
      </div>
      <div style="background:#fff;padding:24px;border:1px solid #eee;border-top:none;border-radius:0 0 12px 12px;">
        <p style="color:#4a5568;line-height:1.6;">Hello${fullName ? ` <strong>${fullName}</strong>` : ''},</p>
        <p style="color:#4a5568;line-height:1.6;">
          Use the code below to access your IYC 2026 registration status and payment details:
        </p>
        <div style="background:#f4f1ff;border:1px solid #e0d6ff;border-radius:10px;padding:18px;text-align:center;margin:20px 0;font-size:32px;font-weight:700;letter-spacing:8px;color:#0b0e37;">${otp}</div>
        <p style="color:#6b7280;font-size:13px;line-height:1.6;">
          This 8-digit code expires in <strong>10 minutes</strong> and can be used only once.
          If you did not request this, you can safely ignore this email.
        </p>
        <p style="color:#4a5568;margin-top:24px;line-height:1.6;">
          Questions? Contact us at
          <a href="mailto:${CONTACT_EMAIL}" style="color:#e1137b;">${CONTACT_EMAIL}</a>
          or call <strong>+91 8123941065</strong>.
        </p>
      </div>
    </div>
  `
}

/** Send the OTP used to access an existing registration via the "Already Registered?" flow. */
export async function sendOtpEmail({ email, otp, fullName, expiresAt }) {
  await sendMail({
    to: email,
    subject: 'IYC 2026 — Registration Access Code',
    html: formatOtpHtml(otp, { fullName, expiresAt }),
  })
}
