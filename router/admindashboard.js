const express = require('express')
const router = express.Router()

const {
  getAllUser,
  getAllUserBalance,
  blockUser,
  logout
} = require('../controller/admidashboard')

const authMiddleware = require('../middleware/auth')


// GET ALL USERS
router.get('/users', authMiddleware, getAllUser)

//  GET DASHBOARD STATS
router.get('/stats', authMiddleware, getAllUserBalance)

router.patch('/:id/block', authMiddleware, blockUser)

module.exports = router



