const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/auth')
const { getAccountName, transfer, checkPin, createPin, changePin,getTransactionHistory ,getSingleHistory, checkDetails} = require('../controller/transaction')

router.get('/account-name', authMiddleware, getAccountName)
router.post('/transfer', authMiddleware, transfer)
router.post('/checkDetails', authMiddleware,checkDetails)
router.get('/check-pin', authMiddleware, checkPin)  
router.post('/create-pin', authMiddleware, createPin)
router.post('/change-pin', authMiddleware, changePin)
router.get('/history', authMiddleware, getTransactionHistory) 
router.get('/user/history/:id', authMiddleware, getSingleHistory )
module.exports = router