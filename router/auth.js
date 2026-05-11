

const express = require('express')
  const router = express.Router()

const {signup,signin,verifyEmail} = require('../controller/auth')

router.route('/verify-email').get(verifyEmail)
router.route('/signup').post( signup)
router.route('/signin').post( signin)




  module.exports = router