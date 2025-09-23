const express = require('express');
const { registerUser, loginUser, getLoggedInUser, logout } = require('../controllers/authController');
const { verifyUser, verifyRole } = require('../middleware/auth');

const router = express.Router();


router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logout);

// Protected route to get current logged in user
router.get('/me', verifyUser, getLoggedInUser);

// Admin only route
router.get('/admin-only', verifyUser, verifyRole(['admin']), (req, res) => {
  res.json({ message: 'Welcome Admin', user: req.user });
});

// Editor or Author route
router.get('/editor-or-author', verifyUser, verifyRole(['editor', 'author']), (req, res) => {
  res.json({ message: 'Welcome Editor/Author', user: req.user });
});

module.exports = router;

