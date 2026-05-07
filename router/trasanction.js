const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/auth')
const { getAccountName, transfer, checkPin, createPin } = require('../controller/transaction')

router.get('/account-name', authMiddleware, getAccountName)
router.post('/transfer', authMiddleware, transfer)
router.get('/check-pin', authMiddleware, checkPin)   // ← changed POST to GET
router.post('/create-pin', authMiddleware, createPin)

module.exports = router