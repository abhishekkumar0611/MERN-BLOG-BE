const User = require('../models/userModel');
const bcrypt = require('bcrypt');

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
    if (!users || users.length === 0) {
      return res.status(404).json({ message: "Users not found" });
    }
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Create new user
exports.createUser = async (req, res) => {
  try {
    const { userName, email, password, role } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      userName,
      password: hashedPassword,
      email,
      role: role || "user"
    });

    res.status(201).json({ newUser: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: `Error creating user: ${error.message}` });
  }
};

// Get user by ID
exports.getUsersById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update user by ID
exports.updateUser = async (req, res) => {
  try {
    const { userName, email, password, role } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (userName) user.userName = userName;
    if (email) user.email = email;
    if (password) user.password = await bcrypt.hash(password, 10);
    if (role) user.role = role;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      userName: updatedUser.userName,
      email: updatedUser.email,
      role: updatedUser.role,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete user by ID
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update user profile (bio, avatar)
exports.updateProfile = async (req, res) => {
  try {
    const { bio, avatar } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { bio, avatar },
      { new: true }
    ).select('-password');

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
