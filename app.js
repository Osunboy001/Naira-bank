require('dotenv').config()
const express = require('express');
const cors = require('cors'); 
const app = express();
const connectDB = require('./db/connect')
const cookieParser = require('cookie-parser')

app.use(cors());     
app.use(express.urlencoded({extended: true}));
app.use(cookieParser())  
app.use(express.json());





app.use(express.static('./public'))

app.use('/img', express.static(__dirname + '/img'));
const home = require('./router/home')
const adminEdit = require('./router/admin-edit')
const users = require('./router/users')
const auth = require('./router/auth')
const adminDashboard = require('./router/admindashboard')
const transaction = require('./router/transaction')
const deposit = require('./router/payment-deposit')

app.use('/api/v1/users', users)
app.use('/api/v1/auth', auth)
app.use('/api/v1/admin', adminDashboard)
app.use('/api/v1/admin', adminEdit)
app.use('/api/v1/transfer', transaction)
app.use('/api/v1/deposit', deposit)
app.use('/api/v1', home)
const port = process.env.PORT || 3000;

const start = async () => {
  try {
    console.log(" Connecting to MongoDB...")
    console.log("MONGO_URI:", process.env.MONGO_URI ? "Set" : " Missing")
    
    await connectDB(process.env.MONGO_URI)
    console.log("MongoDB connected!")
    
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log("Error:", error.message)
    process.exit(1)
  }
};

start();