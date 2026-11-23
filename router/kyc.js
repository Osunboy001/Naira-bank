const express = require('express')
const router = express.Router()

const authMiddleware = require('../middleware/auth')
const adminOnly = require('../middleware/admin')
const uploadKyc = require('../middleware/kyc-upload')

const {
  submitKyc,
  getKyc,
  getKycUsers,
  getKycStats,
  reviewKyc
} = require('../controller/kyc')

// USER
router.get('/', authMiddleware, getKyc)

router.post(
  '/',
  authMiddleware,
  uploadKyc.fields([
    { name: 'document', maxCount: 1 },
    { name: 'selfie', maxCount: 1 }
  ]),
  submitKyc
)

// ADMIN
router.get('/admin/users', authMiddleware, adminOnly, getKycUsers)
router.get('/admin/stats', authMiddleware, adminOnly, getKycStats)
router.patch('/admin/:userId', authMiddleware, adminOnly, reviewKyc)

module.exports = router
