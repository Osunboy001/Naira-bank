const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    maxlength: 50,
    minlength: 3
  },

  email: {
    type: String,
    unique: true,
    match: [/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'Please provide valid email']
  },

  password: {
    type: String,
    required: true
  },

  balance: {
    type: Number,
    default: 10000
  },


  accountnumber: {
    type: String,
    unique: true
  },

  
  role : {
 type: String,
  enum: ['user', 'admin'],
  default: 'user'
  },



status: {
  type: String,
  enum: ["active", "blocked"],
  default: "active"
},

pin: {
  type: String,
  default: null
},
isVerified: {
  type: Boolean,
  default: false  
},

verificationToken: {
  type: String,
  default: null  
}


});





userSchema.pre('save', async function () {
  if (this.isNew && !this.accountnumber) {
    this.accountnumber = "005" + Math.floor(Math.random() * 9000000).toString();
  }


  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// FIXED — only one createJWT
userSchema.methods.createJWT = function() {
  return jwt.sign(
    { userId: this._id, name: this.name, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_LIFETIME || '7d' }
  )
}

userSchema.methods.comparePassword = async function(candidatePassword) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password)
  return isMatch
}

module.exports = mongoose.model('User', userSchema);