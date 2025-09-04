const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  console.log('--- Auth Middleware Triggered ---');
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      console.log('Token found:', token); // Log the token

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token decoded successfully:', decoded);

      req.user = await User.findById(decoded.id).select('-password');
      next(); // Proceed to the next middleware (upload)
    } catch (error) {
      console.error('Token verification failed:', error.message);
      return res.status(401).json({ error: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    console.log('No token found in headers.');
    return res.status(401).json({ error: 'Not authorized, no token' });
  }
};

module.exports = authMiddleware;