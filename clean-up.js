const mongoose = require('mongoose')
require('dotenv').config()

const cleanup = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('Connected to DB')

    await mongoose.connection.collection('users').updateMany(
      {},
      {
        $unset: {
          isOTPVerified: "",
          resetOTP: "",
          resetOTPExpiry: ""
        },
        $set: {
          resetToken: null,
          resetTokenExpiry: null
        }
      }
    )

    console.log('Clean all user')
    process.exit(0)

  } catch (err) {
    console.error('Error:', err.message)
    process.exit(1)
  }

}

cleanup()