const nodemailer = require('nodemailer')

const sendEmail = async ({ to, subject, html }) => {
  try {
    console.log("Creating transporter...")
  const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  port: 587,  // 
  secure: false,
  connectionTimeout: 5000,
  socketTimeout: 5000
})
    console.log(" Sending email to:", to)
    
    const result = await transporter.sendMail({
      from: `"NairaBank" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,

      headers: {
        'X-Priority': '1',
        'Importance': 'high'
      },
      replyTo: process.env.EMAIL_USER
    })

    console.log("Email sent successfully!", result.messageId)
    return result

  } catch (error) {
    console.log(" Email error:", error.message)
    throw error
  }
}

module.exports = sendEmail