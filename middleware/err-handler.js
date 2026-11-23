const { CustomAPIError } = require('../err')
const { StatusCodes } = require('http-status-codes')

const errorHandlerMiddleware = (err, req, res, next) => {
  // Errors we threw on purpose (BadRequest, NotFound, Unauthenticated, ...)
  if (err instanceof CustomAPIError) {
    return res.status(err.statusCode).json({ msg: err.message })
  }

  // Default to a 500 and a generic message, then refine for known cases below.
  let customError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: err.message || 'Something went wrong, please try again later',
  }

  // Multer upload errors (file too large, unexpected field, ...)
  if (err.name === 'MulterError') {
    customError.msg = err.code === 'LIMIT_FILE_SIZE'
      ? 'File is too large. Maximum size is 10MB.'
      : err.message
    customError.statusCode = StatusCodes.BAD_REQUEST
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    customError.msg = Object.values(err.errors).map((item) => item.message).join(', ')
    customError.statusCode = StatusCodes.BAD_REQUEST
  }

  // Duplicate key (e.g. email already registered)
  if (err.code && err.code === 11000) {
    customError.msg = `An account with that ${Object.keys(err.keyValue)} already exists`
    customError.statusCode = StatusCodes.BAD_REQUEST
  }

  // Invalid Mongo ObjectId
  if (err.name === 'CastError') {
    customError.msg = `No item found with id: ${err.value}`
    customError.statusCode = StatusCodes.NOT_FOUND
  }

  return res.status(customError.statusCode).json({ msg: customError.msg })
}

module.exports = errorHandlerMiddleware
