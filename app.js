require('dotenv').config()
const express = require('express');
const cors = require('cors'); 
const app = express();
const connectDB = require('./db/connect')
const cookieParser = require('cookie-parser')

// ---------------------------------------------------------------
// CORS
// Only the site in APP_URL may call this API from a browser.
// Requests with no Origin header (curl, Postman, server-to-server)
// are still allowed; browsers always send Origin on cross-origin
// calls and on same-origin POST/PUT/PATCH/DELETE.
// ---------------------------------------------------------------
const allowedOrigins = [
  process.env.APP_URL,
  'http://localhost:3000',
  'http://127.0.0.1:3000',
].filter(Boolean)

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true)
    }
    return callback(null, false)
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
}

app.use(cors(corsOptions))
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
const notFoundMiddleware = require('./middleware/not-found')
const errorHandlerMiddleware = require('./middleware/err-handler')

app.use('/api/v1/users', users)
app.use('/api/v1/auth', auth)
app.use('/api/v1/admin', adminDashboard)
app.use('/api/v1/admin', adminEdit)
app.use('/api/v1/transactions', transaction)
app.use('/api/v1/deposit', deposit)
app.use('/api/v1/', home)

app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware)

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    console.log(" Connecting to MongoDB...")
    console.log("MONGO_URL:", process.env.MONGO_URL ? "Set" : " Missing")

    await connectDB(process.env.MONGO_URL)
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