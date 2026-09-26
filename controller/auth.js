const { StatusCodes } = require("http-status-codes")
const User = require('../model/user')
const { badRequest, unAuntentication, forbidden } = require('../err')

const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      throw new badRequest("All fields are required")
    }

    await User.create({
      name,
      email,
      password,
      role: "user",
      isVerified: true
    })

    return res.status(StatusCodes.CREATED).json({
      msg: "Account created! You can now login."
    })

  } catch (err) {
    // Duplicate key and Mongoose validation are handled centrally in
    // middleware/err-handler.js, so just hand off.
    next(err)
  }
}

const signin = async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      throw new badRequest("All fields are required")
    }

    const user = await User.findOne({ email })
    // Same message whether the email is unknown or the password is wrong, so we
    // don't reveal which emails have accounts (user enumeration).
    if (!user) {
      throw new unAuntentication("Invalid email or password")
    }

    const isPasswordCorrect = await user.comparePassword(password)
    if (!isPasswordCorrect) {
      throw new unAuntentication("Invalid email or password")
    }

    if (user.status === "blocked") {
      throw new forbidden("Your account is blocked. Contact admin.")
    }

    const token = user.createJWT()

    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    })
      console.log('jjdjdjd' ,user)

    return res.status(StatusCodes.OK).json({
      
      user: { name: user.name, role: user.role, }
    
    })
   

  }



  
 catch (err) {
    next(err)
  }
}

const logout = (req, res) => {
  res.clearCookie('token')
  return res.status(StatusCodes.OK).json({ msg: "Logged out successfully" })
}

module.exports = { signin, signup, logout }