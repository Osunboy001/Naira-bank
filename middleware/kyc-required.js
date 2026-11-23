const { StatusCodes } = require('http-status-codes')
const User = require('../model/user')

const kycRequired = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select('kyc.status')

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'User not found' })
    }

    if (user.kyc?.status !== 'verified') {
      return res.status(StatusCodes.FORBIDDEN).json({
        code: 'KYC_REQUIRED',
        message: 'Please complete your KYC verification before sending money.'
      })
    }

    return next()
  } catch (err) {
    return next(err)
  }
}

module.exports = kycRequired
