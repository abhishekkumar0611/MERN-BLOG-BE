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
    const user = await User.findById(req.user._id, "userName email role").select('-password');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ success: true,  user: user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const { userName, email } = req.body;

    if (!userName || !email) {
      return res.status(400).json({ message: "Username and email are required" });
    }

    // Find and update logged-in user
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id, // coming from auth middleware
      
      { userName, email },
      { new: true, runValidators: true } // return updated doc
    ).select("-password"); // don't return password
  

    res.json({
    
      message: "Profile updated successfully",
      user: updatedUser,
     
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

