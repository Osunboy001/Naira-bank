const unauthorization  = require('../err/autherrorhandler')
const jwt =  require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');

const authMiddleware = async (req,res,next) => {

  const token = req.cookies.token

  if(!token) {
    return res.status(StatusCodes.UNAUTHORIZED).json({message: "No token provided"})
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    console.log(payload);

    req.user = {
      userId: payload.userId,
      name: payload.name,
        role: payload.role  
    };

    next();
  }
      catch (err) {
      console.log(err)
    return res.status(401).json({ message: 'Invalid token' });
      }
}

module.exports = authMiddleware