require('dotenv').config()
const User = require('./model/user')
const mongoose = require('mongoose')

const verify = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    
    await User.updateOne(
      { email: 'nairabank9@gmail.com' },
      { isVerified: true }
    )
    
    console.log(' Admin verified!')
    process.exit(0)
  } catch (err) {
    console.log(' Error:', err.message)
    process.exit(1)
  }
}

verify()