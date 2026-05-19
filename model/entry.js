const mongoose =require('mongoose')

const entrySchema = new mongoose.Schema({
  counterParty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  userId : {
     type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  direction: {
   type: String,
   enum : ['debit','credit']
  },

status : {
  type: String,
  enum: ['success','failed'],
  default: 'success'
},
amount : {
  type: Number,
  

}


},


 { timestamps: true

  }
)



module.exports = mongoose.model('Entry', entrySchema)
