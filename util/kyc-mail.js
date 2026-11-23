const axios = require('axios')

const SENDER = { name: 'NairaBank', email: 'nairabank9@gmail.com' }

const escapeHtml = (value) =>
  String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const SUBJECTS = {
  submitted: 'KYC submission received',
  verified: 'Your identity has been verified',
  rejected: 'Action needed: your KYC was rejected'
}

const buildContent = ({ name, status, rejectionReason }) => {
  const safeName = escapeHtml(name || 'there')
  const kycUrl = `${process.env.APP_URL || ''}/kyc.html`

  if (status === 'verified') {
    return `
      <h2>Identity verified</h2>
      <p>Hi ${safeName},</p>
      <p>Your KYC has been approved. Your identity is now verified and you have full access to NairaBank services.</p>
    `
  }

  if (status === 'rejected') {
    return `
      <h2>KYC needs attention</h2>
      <p>Hi ${safeName},</p>
      <p>We could not verify your identity with the details you submitted.</p>
      <p><strong>Reason:</strong> ${escapeHtml(rejectionReason || 'The submitted details did not match our records.')}</p>
      <p>You can correct the details and upload a clearer document to try again.</p>
      <a href="${kycUrl}" style="display:inline-block;padding:12px 24px;background:#671ee5;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;">Try again</a>
    `
  }

  return `
    <h2>We received your KYC details</h2>
    <p>Hi ${safeName},</p>
    <p>Thanks for submitting your identity documents. Our team is reviewing your details now.</p>
    <p>We will email you as soon as a decision is made.</p>
  `
}

// Fire-and-forget: KYC requests must not fail because email delivery failed.
const sendKycEmail = async ({ to, name, status, rejectionReason = null }) => {
  if (!to || !process.env.BREVO_API_KEY) return false

  try {
    await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: SENDER,
        to: [{ email: to }],
        subject: SUBJECTS[status] || 'KYC update',
        htmlContent: buildContent({ name, status, rejectionReason })
      },
      {
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    )
    return true
  } catch (err) {
    console.error('KYC email failed:', err.message)
    return false
  }
}

module.exports = { sendKycEmail }
