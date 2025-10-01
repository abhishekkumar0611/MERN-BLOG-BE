const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Verify user is authenticated (using cookie)
 /* const verifyUser = async (req, res, next) => {
  
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
};  */

const verifyUser = async (req, res, next) => {
  try {
    const token = req.cookies?.token || req.headers?.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded.id should be a valid ObjectId string

    const user = await User.findById(decoded.id).select("-password");
   
    if (!user) {
      return res.status(404).json({ message: "Invalid token - user not found" });
    }

    req.user = user; // attach the full user doc (or attach just id if you prefer)
    next();
  } catch (err) {
    console.error("Auth middleware error:", err.message);
    return res.status(401).json({ message: "Unauthorized - Invalid or expired token" });
  }
};


/* const verifyUser = async (req, res, next) => {
  try {
    const token = req.cookies.token; // or req.headers.authorization
    if (!token) return res.status(401).json({ message: "No token, authorization denied" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to req
    req.user = { _id: decoded.id }; //  must be a valid ObjectId
    next();
  } catch (err) {
    res.status(401).json({ message: "Token not valid" });
  }
}; */

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
