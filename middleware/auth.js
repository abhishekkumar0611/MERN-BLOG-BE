const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Verify user is authenticated (using cookie)
const verifyUser = async (req, res, next) => {
  
  try {
    const token = req.cookies.token;  // Read token from cookies

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
     

    const user = await User.findById(decoded.id).select('-password');
    

    if (!user) {
      return res.status(404).json({ message: 'Invalid token - user not found' });
    }

    req.user = user;  // Attach user to request object
    next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    return res.status(401).json({ message: 'Unauthorized - Invalid or expired token' });
  }
};

// Verify admin role
const verifyAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  
  return res.status(403).json({
    message: 'Forbidden. Admins only.',
    role: req.user ? req.user.role : null,
  });
};

// Flexible role-based access control
const verifyRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized, please login first' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Requires role(s): ${allowedRoles.join(', ')}`,
      });
    }

    next();
  };
};

module.exports = { verifyUser, verifyAdmin, verifyRole };
