
const { StatusCodes } = require("http-status-codes")


const badRequest = require('../err/badrequesterr')
const unauth = require('../err/autherrorhandler')
const User = require('../model/user')

const signup = async (req,res) => {
  const {name,email,password} = req.body

    const existingUser = await User.findOne({ email })
    if(existingUser) {
      throw new badRequest("Email already in use")
    }
const user = await User.create({name,email,password,role: "user"})

const token = user.createJWT()

res.status(StatusCodes.CREATED).json({user:{name:user.name},token})
}


const signin = async (req, res) => {
  const { email, password } = req.body

  const user = await User.findOne({ email })
  if (!user) throw new unauth('User does not exist')

  const isPasswordCorrect = await user.comparePassword(password)
  if (!isPasswordCorrect) throw new unauth("Invalid email or password")

  if (user.status === "blocked") {
    throw new unauth("Your account is blocked. Contact admin.")
  }

  const token = user.createJWT()

  return res.status(200).json({
    user: { name: user.name, role: user.role },
    token
  })
}



module.exports ={
  signin,
  signup
}