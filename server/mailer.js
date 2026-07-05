import nodemailer from 'nodemailer'

let transporter = null

const CONTACT_EMAIL = process.env.FROM_EMAIL || process.env.SMTP_USER || 'info@indianyouthconference.com'

function getTransporter() {
  if (transporter) return transporter

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return null
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  })

  return transporter
}

function formatRegistrationHtml(data) {
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
    ['Arrival Date', data.arrivalDate],
    ['Departure Date', data.departureDate],
    ['Program Preference', data.programPreference],
    ['How did you know IYC', data.howDidYouKnow],
    ['Attended IYC before', data.pastAttendance],
    ['Emergency Contact', data.emergencyContactName],
    ['Emergency Number', data.emergencyContactNumber],
    ['Payment Screenshot', 'Attached to this email'],
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
        <p style="color:#4a5568;line-height:1.6;margin-top:0;">A new registration has been submitted. Please review the payment screenshot in the admin portal and verify the registration.</p>
        <table style="width:100%;border-collapse:collapse;">${tableRows}</table>
      </div>
    </div>
  `
}

function formatVerifiedHtml(data) {
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
          (October 16–20, 2026) have been <strong>verified</strong> by our team.
        </p>
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:20px 0;">
          <p style="margin:0 0 8px;color:#166534;font-weight:600;">Your confirmed registration:</p>
          <p style="margin:4px 0;color:#4a5568;"><strong>Section:</strong> ${data.sectionConference}</p>
          <p style="margin:4px 0;color:#4a5568;"><strong>Fee:</strong> ₹${data.fee} (${data.feeLabel})</p>
          <p style="margin:4px 0;color:#4a5568;"><strong>Arrival:</strong> ${data.arrivalDate}</p>
          <p style="margin:4px 0;color:#4a5568;"><strong>Departure:</strong> ${data.departureDate}</p>
          <p style="margin:4px 0;color:#4a5568;"><strong>Program:</strong> ${data.programPreference}</p>
        </div>
        <p style="color:#4a5568;line-height:1.6;">
          <strong>Venue:</strong> Mount Zion campus, Lena Vilakku, Pilivalam P.O, Thirumayam Tk,
          Pudukkottai, Tamil Nadu 622507
        </p>
        <p style="color:#4a5568;line-height:1.6;">
          For questions, reach us at
          <a href="mailto:${CONTACT_EMAIL}" style="color:#e1137b;">${CONTACT_EMAIL}</a>
          or call <strong>+91 8123941065</strong>.
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

async function sendMail({ to, subject, html, replyTo, attachments = [] }) {
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
    attachments,
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

  await sendMail({
    to: adminEmail,
    replyTo: data.email,
    subject: `[IYC] New Registration: ${data.fullName} — ₹${data.fee}`,
    html: formatRegistrationHtml(data),
    attachments,
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
