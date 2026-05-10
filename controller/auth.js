const { StatusCodes } = require("http-status-codes")
const User = require('../model/user')


const sendEmail = require('../utils/sendEmail')
const crypto = require('crypto')


const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" })
    }

    // I generate random verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')

    //  create user with token
    const user = await User.create({
      name,
      email,
      password,
      role: "user",
      verificationToken
    })

    //  build verification link
    const verifyLink = `http://localhost:3000/api/v1/auth/verify-email?token=${verificationToken}&email=${email}`

  console.log("Sending email to:", user.email)
console.log("Using email user:", process.env.EMAIL_USER)
   sendEmail({
  to: email,
  subject: 'Verify your NairaBank account - ACTION REQUIRED',
  html: `
    <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #0a7c4e;">Welcome to NairaBank, ${name}</h2>
      <p><strong>To finish setting up your account and start using Nairabank please verify your email </strong></p>
      <p style="background: #0a7c4e; padding: 20px; border-radius: 8px;">
        <a href="${verifyLink}" style="
          color: white;
          text-decoration: none;
          font-weight: bold;
          font-size: 16px;
        "> VERIFY Email </a>
      </p>
      <p style="color: #888; font-size: 13px;">If you didn't create this account, ignore this email.</p>
    </div>
  `
})

    return res.status(201).json({
      message: "Account created! Please check your email to verify your account."
    })

  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
}





const signin = async (req, res) => {


  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: "User does not exist" })
    }

    const isPasswordCorrect = await user.comparePassword(password)
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid email or password" })
    }

   if (!user.isVerified) {
      return res.status(401).json({
        message: "Please verify your email before logging in!"
      })
    }

    if (user.status === "blocked") {
      return res.status(403).json({ message: "Your account is blocked. Contact admin." })
    }

    const token = user.createJWT()

    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    })

    return res.status(200).json({
      user: { name: user.name, role: user.role }
    })


  }

   catch (err) {
    return res.status(500).json({ message: err.message })
  
}
}

  
  


const logout = (req, res) => {
  res.clearCookie('token')
  return res.status(200).json({ message: "Logged out successfully" })
}


const verifyEmail = async (req, res) => {
  try {
    const { token, email } = req.query

    const user = await User.findOne({ email })

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    if (user.verificationToken !== token) {
      return res.status(400).json({ message: "Invalid verification link" })
    }

    //  activate account
    user.isVerified = true
    user.verificationToken = null
    await user.save()

    // redirect to login page
    res.redirect('http://localhost:3000/login-user.html?verified=true')

  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = { signin, signup, logout, verifyEmail }