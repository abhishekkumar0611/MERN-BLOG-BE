const express = require('express');
const router = express.Router();
const { verifyUser, verifyAdmin } = require('../middleware/auth');
const {
  createUser,
  getAllUsers,
  getUsersById,
  updateUser,
  deleteUser,
  getUserProfile,
  updateProfile
} = require('../controllers/userController');

// Admin routes
router.post('/', verifyUser, verifyAdmin, createUser);
router.get('/', verifyUser, verifyAdmin, getAllUsers);
router.get('/:id', verifyUser, verifyAdmin, getUsersById);

// User routes
router.put('/:id', verifyUser, updateUser);
router.delete('/:id', verifyUser, deleteUser);

// Profile routes
router.get('/profile', verifyUser, getUserProfile);
router.put('/update', verifyUser, updateProfile);

module.exports = router;
