const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/auth')
const { getAccountName, transfer, checkPin, createPin,getTransactionHistory } = require('../controller/transaction')

router.get('/account-name', authMiddleware, getAccountName)
router.post('/transfer', authMiddleware, transfer)
router.get('/check-pin', authMiddleware, checkPin)   // ← changed POST to GET
router.post('/create-pin', authMiddleware, createPin)
router.get('/history', authMiddleware, getTransactionHistory)  // new route for transaction history
module.exports = router