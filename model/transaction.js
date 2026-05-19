const mongoose = require('mongoose')

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['transfer', 'deposit', 'withdraw'],
    required: true
  },

  amount: {
    type: Number,
    required: true
  },

  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  status: {
    type: String,
    enum: ['success', 'failed'],
    default: 'success'
  },



},
 { timestamps: true

  }


) 


module.exports = mongoose.model('Transaction', transactionSchema)