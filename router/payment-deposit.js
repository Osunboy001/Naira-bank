const express = require('express')
const router = express.Router()


const {initializepayment, verifyPayment,webhook} = require('../controller/deposit')


const authMiddleware = require('../middleware/auth')



router.post('/initialize', authMiddleware, initializepayment)
router.post("/webhook",webhook)
router.get('/verify', authMiddleware,verifyPayment)

module.exports = router