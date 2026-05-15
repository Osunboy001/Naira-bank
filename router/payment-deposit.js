const express = require('express')
const router = express.Router()


const {initializepayment} = require('../controller/deposit')


const authMiddleware = require('../middleware/auth')


router.post('/initialize', authMiddleware, initializepayment)


module.exports = router