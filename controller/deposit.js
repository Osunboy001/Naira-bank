const myUser = require('../model/user');
const Transaction = require('../model/transaction');
const transaction = require('../model/transaction');

const initializepayment = async (req, res) => {
try {
  const {amount} = req.body
  const user = await myUser.findById(req.user.userId)
  if (!user) return res.status(404).json({ message: "User not found" })

const response = await fetch('https://api.paystack.co/transaction/initialize', {


    method: 'POST',
    headers: { 
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY }`,

   'Content-Type': 'application/json' },

body: JSON.stringify({
  email: user.email,
  amount: amount * 100,

})
})

const data = await response.json()
if (!data.status) {
  return res.status(400).json({ message: data.message || 'Payment initialization failed' })
}
res.status(200).json({ authorization_url: data.data.authorization_url })




}
catch (err) {
  res.status(500).json({ message: err.message })
}

}


const verifyPayment = async (req, res) => {
try {
  const { reference } = req.query 
const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
  method: 'GET',
  headers: {  
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY }`,
    'Content-Type': 'application/json' 
  }

})
const data = await response.json()
if(!data.status) {
  return res.status(400).json({message: "Payment verification failed"})
}
if(data.status && data.data.status === 'success') {
const user = await myUser.findById(req.user.userId)
if(!user) {
  return res.status(400).json({message: "user not found"})
}
user.balance += parseInt(data.data.amount) / 100           
await user.save()

await Transaction.create(
  {
    type: 'deposit',
     amount: data.data.amount / 100,
      from: 'Paystack', to: user._id, 
      status: 'completed'
  }
)

return res.status(200).json({message:"Payment verified successfully"})

}
}
catch(err) {
res.status(500).json({message: err.message})
}




}

const webhook =  async (req, res) => {
  try {
    const event = req.body
    
    console.log("Webhook event:", event.event)
    
    // Only handle successful payments
    if (event.event === 'charge.success') {
      const reference = event.data.reference
      
      // Use your existing verifyPayment logic
      const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
      })
      
      const data = await response.json()
      
      if (data.status && data.data.status === 'success') {
        // Find user by email (important!)
        const user = await myUser.findOne({ email: data.data.customer.email })
        
        if (user) {
          user.balance += parseInt(data.data.amount) / 100
          await user.save()
          
          await Transaction.create({
            type: 'deposit',
            amount: data.data.amount / 100,
            from: 'Paystack',
            to: user._id,
            status: 'completed',
            reference: reference
          })
          
          console.log(` Webhook: ${user.email} balance updated`)
        }
      }
    }
    
    // Always return 200!
    res.status(200).json({ message: 'Webhook received' })
    
  } catch (error) {
    console.log("Webhook error:", error.message)
    res.status(200).json({ message: 'Webhook received' })
  }
}


module.exports = { initializepayment, verifyPayment,webhook}