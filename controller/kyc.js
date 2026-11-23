const { StatusCodes } = require('http-status-codes')
const path = require('path')
const fs = require('fs')
const User = require('../model/user')
const { sendKycEmail } = require('../util/kyc-mail')

const ALLOWED_DOCUMENTS = ['nin_slip', 'national_id', 'drivers_license', 'passport']
const KYC_STATUSES = ['unverified', 'pending', 'verified', 'rejected']

const removeStoredFile = (filePath) => {
  if (!filePath) return
  const absolute = path.join(__dirname, '../public', filePath)
  if (fs.existsSync(absolute)) {
    fs.unlinkSync(absolute)
  }
}

const removeUploadedFile = (file) => {
  if (file && file.path && fs.existsSync(file.path)) {
    fs.unlinkSync(file.path)
  }
}

const cleanupUploads = (req) => {
  if (!req.files) return
  Object.values(req.files).flat().forEach(removeUploadedFile)
}

const submitKyc = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId)

    if (!user) {
      cleanupUploads(req)
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'User not found' })
    }

    const currentKyc = user.kyc || {}

    if (currentKyc.status === 'pending') {
      cleanupUploads(req)
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Your KYC is already under review. Please wait for an admin to review it.'
      })
    }

    if (currentKyc.status === 'verified') {
      cleanupUploads(req)
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Your identity has already been verified.'
      })
    }

    const { nin, fullName, dateOfBirth, address, documentType } = req.body
    const normalizedNin = String(nin || '').trim()
    const cleanFullName = String(fullName || '').trim()
    const cleanAddress = String(address || '').trim()
    const cleanDocumentType = documentType || 'nin_slip'

    if (!/^\d{11}$/.test(normalizedNin)) {
      cleanupUploads(req)
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'NIN must be exactly 11 digits'
      })
    }

    if (cleanFullName.length < 3) {
      cleanupUploads(req)
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Please enter the full name on your NIN'
      })
    }

    const dob = new Date(dateOfBirth)
    if (!dateOfBirth || isNaN(dob.getTime()) || dob >= new Date()) {
      cleanupUploads(req)
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Please enter a valid date of birth'
      })
    }

    if (cleanAddress.length < 5) {
      cleanupUploads(req)
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Please enter your residential address'
      })
    }

    if (!ALLOWED_DOCUMENTS.includes(cleanDocumentType)) {
      cleanupUploads(req)
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Invalid document type'
      })
    }

    const documentFile = req.files?.document?.[0]
    const selfieFile = req.files?.selfie?.[0]

    if (!documentFile && !currentKyc.document) {
      cleanupUploads(req)
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Please upload a clear photo or PDF of your NIN slip / ID document'
      })
    }

    const ninTaken = await User.findOne({
      'kyc.nin': normalizedNin,
      _id: { $ne: user._id }
    })

    if (ninTaken) {
      cleanupUploads(req)
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'This NIN is already linked to another account'
      })
    }

    const oldDocument = currentKyc.document
    const oldSelfie = currentKyc.selfie

    user.kyc = {
      status: 'pending',
      nin: normalizedNin,
      fullName: cleanFullName,
      dateOfBirth: dob,
      address: cleanAddress,
      documentType: cleanDocumentType,
      document: documentFile ? `/uploads/${documentFile.filename}` : oldDocument,
      selfie: selfieFile ? `/uploads/${selfieFile.filename}` : oldSelfie || null,
      rejectionReason: null,
      submittedAt: new Date(),
      reviewedAt: null,
      reviewedBy: null
    }

    await user.save()

    // Only remove the old files once the new details are safely saved.
    if (documentFile && oldDocument) removeStoredFile(oldDocument)
    if (selfieFile && oldSelfie) removeStoredFile(oldSelfie)

    sendKycEmail({
      to: user.email,
      name: user.name,
      status: 'submitted'
    })

    return res.status(StatusCodes.OK).json({
      message: 'KYC submitted successfully. Your details are now under review.',
      kyc: {
        status: user.kyc.status,
        submittedAt: user.kyc.submittedAt
      }
    })
  } catch (err) {
    cleanupUploads(req)
    next(err)
  }
}

const getKyc = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId)

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'User not found' })
    }

    const kyc = user.kyc || {}

    return res.status(StatusCodes.OK).json({
      status: kyc.status || 'unverified',
      nin: kyc.nin || null,
      fullName: kyc.fullName || null,
      dateOfBirth: kyc.dateOfBirth || null,
      address: kyc.address || null,
      documentType: kyc.documentType || 'nin_slip',
      document: kyc.document || null,
      selfie: kyc.selfie || null,
      rejectionReason: kyc.rejectionReason || null,
      submittedAt: kyc.submittedAt || null,
      reviewedAt: kyc.reviewedAt || null
    })
  } catch (err) {
    next(err)
  }
}

// ── ADMIN ──

const getKycUsers = async (req, res, next) => {
  try {
    const { status } = req.query
    const filter = { role: 'user' }

    if (status === 'unverified') {
      // Users created before KYC existed have no kyc object at all.
      filter.$or = [
        { 'kyc.status': 'unverified' },
        { 'kyc.status': { $exists: false } },
        { 'kyc.status': null },
        { kyc: { $exists: false } }
      ]
    } else if (status && KYC_STATUSES.includes(status)) {
      filter['kyc.status'] = status
    } else {
      filter['kyc.status'] = { $in: ['pending', 'verified', 'rejected'] }
    }

    const users = await User.find(filter)
      .select('name email accountnumber status kyc')
      .sort({ 'kyc.submittedAt': -1 })

    return res.status(StatusCodes.OK).json({
      users,
      count: users.length
    })
  } catch (err) {
    next(err)
  }
}

const getKycStats = async (req, res, next) => {
  try {
    const [pending, verified, rejected, unverified] = await Promise.all([
      User.countDocuments({ role: 'user', 'kyc.status': 'pending' }),
      User.countDocuments({ role: 'user', 'kyc.status': 'verified' }),
      User.countDocuments({ role: 'user', 'kyc.status': 'rejected' }),
      User.countDocuments({
        role: 'user',
        $or: [
          { 'kyc.status': 'unverified' },
          { 'kyc.status': { $exists: false } },
          { 'kyc.status': null },
          { kyc: { $exists: false } }
        ]
      })
    ])

    return res.status(StatusCodes.OK).json({
      pending,
      verified,
      rejected,
      unverified
    })
  } catch (err) {
    next(err)
  }
}

const reviewKyc = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body

    if (!['verified', 'rejected'].includes(status)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Status must be either verified or rejected'
      })
    }

    if (status === 'rejected' && String(rejectionReason || '').trim().length < 3) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Please provide a reason for rejecting this KYC'
      })
    }

    const user = await User.findById(req.params.userId)

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'User not found' })
    }

    if (!user.kyc || !user.kyc.nin) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'This user has not submitted KYC details yet'
      })
    }

    user.kyc.status = status
    user.kyc.rejectionReason = status === 'rejected' ? String(rejectionReason).trim() : null
    user.kyc.reviewedAt = new Date()
    user.kyc.reviewedBy = req.user.userId

    await user.save()

    sendKycEmail({
      to: user.email,
      name: user.name,
      status,
      rejectionReason: user.kyc.rejectionReason
    })

    return res.status(StatusCodes.OK).json({
      message: status === 'verified' ? 'KYC approved' : 'KYC rejected',
      kyc: {
        status: user.kyc.status,
        reviewedAt: user.kyc.reviewedAt,
        rejectionReason: user.kyc.rejectionReason
      }
    })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  submitKyc,
  getKyc,
  getKycUsers,
  getKycStats,
  reviewKyc
}
