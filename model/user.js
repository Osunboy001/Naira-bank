const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const kycSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['unverified', 'pending', 'verified', 'rejected'],
    default: 'unverified'
  },

  nin: {
    type: String,
    default: null
  },

  fullName: {
    type: String,
    default: null
  },

  dateOfBirth: {
    type: Date,
    default: null
  },

  address: {
    type: String,
    default: null
  },

  documentType: {
    type: String,
    enum: ['nin_slip', 'national_id', 'drivers_license', 'passport'],
    default: 'nin_slip'
  },

  document: {
    type: String,
    default: null
  },

  selfie: {
    type: String,
    default: null
  },

  rejectionReason: {
    type: String,
    default: null
  },

  submittedAt: {
    type: Date,
    default: null
  },

  reviewedAt: {
    type: Date,
    default: null
  },

  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, { _id: false })

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    maxlength: 50,
    minlength: 3
  },

  firstName: {
    type: String,
    default: null,
    trim: true
  },

  lastName: {
    type: String,
    default: null,
    trim: true
  },

  location: {
    type: String,
    default: null,
    trim: true
  },

  dateOfBirth: {
    type: Date,
    default: null
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

resetToken: { 
  type: String, 
  default: null 

},

resetTokenExpiry: {
  type: Date,
  default: null
},

  profilePicture: {
    type: String,
    default: null  
  },

  kyc: {
    type: kycSchema,
    default: () => ({})
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