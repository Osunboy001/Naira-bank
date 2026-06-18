const User = require('../model/user')
const axios = require('axios')
const crypto = require('crypto')

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body

    // Check if user exists
    const userExists = await User.findOne({ email })
    // I write this code here because i don't want to show my existing user out to make know hacker guess the what i have
    if (!userExists) {
      return res.status(200).json({ message: 'OTP sent,check your email' })
    }

    // Generate random token
    const resetToken = crypto.randomBytes(32).toString('hex')

    // Set expiry time (1 hour)
    const expiryTime = new Date(Date.now() + 60 * 60 * 1000)

    // Save token to user
    userExists.resetToken = resetToken
    userExists.resetTokenExpiry = expiryTime
    userExists.isOTPVerified = false
    await userExists.save()

    // Create reset link
    const resetLink = `${process.env.APP_URL}/reset-password.html?token=${resetToken}`

    // Send email via Brevo
    try {
      await axios.post('https://api.brevo.com/v3/smtp/email', {
        sender: { name: 'NairaBank', email: 'nairabank9@gmail.com' },
        to: [{ email }],
        subject: 'Password Reset Request',
        htmlContent: `
          <h2>Password Reset Request</h2>
          <p>Hi ${userExists.name},</p>
          <p>Click the button below to reset your password:</p>
          <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background: rgb(45, 156, 219); color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold;">
            Reset Password
          </a>
          <p>This link expires in 1 hour.</p>
          <p>If you didn't request this, ignore this email.</p>
        `
      }, {
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json'
        }
      })
    } catch (emailErr) {
      console.error('Email sending failed:', emailErr.message)
      return res.status(500).json({ message: 'Failed to send reset email' })
    }

    return res.status(200).json({
      message: 'Reset link sent to your email'
    })

  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = { forgotPassword }