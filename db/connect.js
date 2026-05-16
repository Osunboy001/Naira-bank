const mongoose = require('mongoose')

const connectDB = (url) => {
  return mongoose.connect(url)
    .then(() => {
      console.log('MongoDB connected successfully,your mongo URI is correct')
    })
    .catch((err) => {
      console.log(' MongoDB connection failed:', err.message)
      throw err
    })
}

module.exports = connectDB