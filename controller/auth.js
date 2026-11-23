const { StatusCodes } = require("http-status-codes")
const User = require('../model/user')
const { badRequest, unAuntentication, forbidden } = require('../err')

const signup = async (req, res, next) => {
  try {
    const { firstName, lastName, location, dateOfBirth, email, password } = req.body

    if (!firstName || !lastName || !location || !dateOfBirth || !email || !password) {
      throw new badRequest("All fields are required")
    }

    const cleanFirstName = String(firstName).trim()
    const cleanLastName = String(lastName).trim()
    const cleanLocation = String(location).trim()

    if (cleanFirstName.length < 2 || cleanLastName.length < 2) {
      throw new badRequest("First name and last name must be at least 2 characters")
    }

    if (cleanLocation.length < 3) {
      throw new badRequest("Please provide your location")
    }

    const dob = new Date(dateOfBirth)
    if (isNaN(dob.getTime()) || dob >= new Date()) {
      throw new badRequest("Please provide a valid date of birth")
    }

    await User.create({
      name: `${cleanFirstName} ${cleanLastName}`.trim(),
      firstName: cleanFirstName,
      lastName: cleanLastName,
      location: cleanLocation,
      dateOfBirth: dob,
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
      throw new forbidden("Your account is blocked. Contact the organisation.")
    }

    const token = user.createJWT()

    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    })

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