

const express = require('express')
  const router = express.Router()

const {signup,signin} = require('../controller/auth')
const {forgotPassword} = require('../controller/forget-password')

const { resetPassword} = require('../controller/reset-password')

router.route('/signup').post( signup)
router.route('/signin').post( signin)
router.route('/forgot-password').post(forgotPassword)
router.route('/reset-password').post(resetPassword)


  module.exports = router