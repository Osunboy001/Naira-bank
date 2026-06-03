

const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/auth')
const { getSingleUser, updateUser } = require('../controller/admin-edit')
const upload = require('../middleware/multer-middleware')

// GET single user
router.get('/user/:id', authMiddleware, getSingleUser)

// UPDATE user (with image upload)
router.put('/user/:id', upload.single('profilePicture'), updateUser)

module.exports = router