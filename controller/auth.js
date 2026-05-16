const { StatusCodes } = require("http-status-codes")
const User = require('../model/user')

const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" })
    }

    const user = await User.create({
      name,
      email,
      password,
      role: "user",
      isVerified: true  
    })

    return res.status(201).json({
      message: "Account created! You can now login."
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

  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
}

const logout = (req, res) => {
  res.clearCookie('token')
  return res.status(200).json({ message: "Logged out successfully" })
}

module.exports = { signin, signup, logout }

