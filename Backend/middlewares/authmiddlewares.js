//after signin you got a jwt token for each further request your backend code would check you are correct user or not 
// The protect function is a middleware that ensures only logged-in users (with valid JWT tokens) 
// can access certain routes — like /api/user/me, or eventually, booking an interview.

// middleware is a simple function that is used between request response cycle
//  to verify the inputs, tokens or to change the inputs

const jwt = require('jsonwebtoken');
const User = require('../models/user');

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch (err) {
    return res.status(401).json({ msg: 'Token is not valid' });
  }
};

module.exports = protect;
