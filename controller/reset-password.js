const User = require('../model/user')
const bcrypt = require('bcryptjs')

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body

    // Validate passwords
    if (!token) {
      return res.status(400).json({ message: 'Invalid token' })
    }

    if (!newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'Please fill all fields' })
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' })
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' })
    }

    // Find user by token
    const user = await User.findOne({ resetOTP: token })
    
    if (!user) {
      return res.status(404).json({ message: 'Invalid token' })
    }

    // Check if token expired
    if (new Date() > user.resetOTPExpiry) {
      return res.status(400).json({ message: 'Reset link expired. Request a new one' })
    }

  

    // Update user
    user.password = newPassword
    user.resetOTP = null
    user.resetOTPExpiry = null
    user.isOTPVerified = false
    await user.save()

    return res.status(200).json({
      message: 'Password reset successfully. You can now login'
    })

  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = { resetPassword }