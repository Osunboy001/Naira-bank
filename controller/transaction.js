const bcrypt = require("bcryptjs")
const myUser = require("../model/user")
const Transaction = require("../model/transaction") // 
const Entry = require("../model/entry")
const { getSingleUser } = require("./admin-edit")
const createPin = async (req, res) => {
  try {
    const { pin } = req.body
    if (!pin) return res.status(400).json({ message: "PIN is required" })

    const user = await myUser.findById(req.user.userId)
    if (!user) return res.status(404).json({ message: "User not found" })
    if (user.pin) return res.status(400).json({ message: "PIN already exists" })

    const salt = await bcrypt.genSalt(10)
    user.pin = await bcrypt.hash(pin, salt)
    await user.save()

    res.status(200).json({ success: true, message: "PIN created successfully" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const checkPin = async (req, res) => {
  try {
    const user = await myUser.findById(req.user.userId).select("pin")
    if (!user) return res.status(404).json({ message: "User not found" })
    res.status(200).json({ success: true, hasPin: !!user.pin })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const getAccountName = async (req, res) => {
  try {
    const { accountnumber } = req.query
    if (!accountnumber) return res.status(400).json({ success: false, message: "Account number required" })

    const user = await myUser.findOne({ accountnumber }).select("name status")
    if (!user) return res.status(404).json({ success: false, message: "Account not found" })
    if (user.status === "blocked") return res.status(403).json({ success: false, message: "Account is blocked" })

    res.status(200).json({ success: true, data: { name: user.name } })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const transfer = async (req, res) => {
  try {
    const { accountnumber, amount, pin } = req.body

    if (!accountnumber || !amount || !pin) {
      return res.status(400).json({ message: "All fields are required" })
    }

    const sender = await myUser.findById(req.user.userId)
    const receiver = await myUser.findOne({ accountnumber })

    if (!sender) return res.status(404).json({ message: "Sender not found" })
    if (!receiver) return res.status(404).json({ message: "Receiver not found" })

    if (sender.accountnumber === accountnumber) {
      return res.status(400).json({ message: "Cannot send to yourself" })
    }

    if (receiver.status === "blocked") {
      return res.status(403).json({ message: "Receiver account is blocked" })
    }

    if (!sender.pin) {
      return res.status(400).json({ message: "Please create a PIN first" })
    }

    const isMatch = await bcrypt.compare(pin, sender.pin)
    if (!isMatch) return res.status(400).json({ message: "Incorrect PIN" })

    if (sender.balance < amount) {
      await Transaction.create({ type: "transfer", amount, from: sender._id, to: receiver._id, status: "failed" })
      return res.status(400).json({ message: "Insufficient balance" })
    }

    sender.balance -= amount
    receiver.balance += amount
    await sender.save()
    await receiver.save()

    await Transaction.create({ type: "transfer", amount, from: sender._id, to: receiver._id, status: "success" })

await Entry.create({
  userId: sender._id,
 counterParty:  receiver._id,
  direction: 'debit',
   status: "success",
   amount,
})

await Entry.create({
   userId: receiver._id,
  counterParty:  sender._id,
   direction: 'credit', 
   status: "success",
   amount,
         
 
 })
    res.status(200).json({ success: true, message: "Transfer successful", newBalance: sender.balance })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}









   





 
// Get transaction history for the logged in user
const getTransactionHistory = async (req, res) => {
  try {
    // Find all transactions where user is sender OR receiver
    const transactions = await Entry.find({
     
         userId: req.user.userId 
     
      
    })




    // create a populate to know user details
      .populate('userId', 'name accountnumber')
      .populate('counterParty', 'name accountnumber')
      
      .sort({ createdAt: -1 }) 
  
    
    if (!transactions || transactions.length === 0) {
      return res.status(200).json({ 
        success: true, 
        transactions: [],
        message: 'No transaction history found'
      })
    }
    
    // Format the response for your frontend
    const formattedTransactions =  transactions.map(t => ({
      userId: t.userId,
    counterParty: t.counterParty,
      amount: t.amount,
      direction: t.direction,
      status: t.status,
      date: t.createdAt,
      transactionId: t._id
    }))

    
    
    res.status(200).json({ 
      success: true, 
      transactions: formattedTransactions 
    })
    console.log(transactions)
    
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
const getSingleHistory = async (req,res) => {

    try {
      const user = await Entry.findById(req.params.id)
     .populate('userId', 'name accountnumber')
      .populate('counterParty', 'name accountnumber')
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
     
  
      res.json({ user });
  
    } 
    
    
    
    
    catch (err) {
      res.status(500).json({ message: err.message });
    }
}



module.exports = { getAccountName, transfer, checkPin, createPin ,getTransactionHistory,getSingleHistory}