const jwt = require('jsonwebtoken')
const User = require('../model/user')

// Pages that must not be reachable until KYC is verified.
const PROTECTED_PAGES = new Set([
  '/user-dashboard.html',
  '/transaction.html',
  '/transaction-detail.html',
  '/full-history.html',
  '/settings.html',
  '/deposit.html',
  '/withdraw.html',
  '/create-pin.html'
])

const redirectToLogin = (res) => res.redirect('/login-user.html')
const redirectToKyc = (res) => res.redirect('/kyc.html')

const kycPageGuard = async (req, res, next) => {
  if (req.method !== 'GET') return next()

  const page = req.path.toLowerCase()
  if (!PROTECTED_PAGES.has(page)) return next()

  const token = req.cookies && req.cookies.token
  if (!token) return redirectToLogin(res)

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    if (payload.role === 'admin') return next()

    const user = await User.findById(payload.userId).select('role kyc.status')
    if (!user) return redirectToLogin(res)
    if (user.role === 'admin') return next()
    if (user.kyc?.status !== 'verified') return redirectToKyc(res)

    return next()
  } catch (err) {
    return redirectToLogin(res)
  }
}

module.exports = kycPageGuard
