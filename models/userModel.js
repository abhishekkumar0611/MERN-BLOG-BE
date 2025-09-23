const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const userSchema = new mongoose.Schema({
  id: {                     
    type: Number,
    unique: true
  },
  userName: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: { 
    type: String, 
    enum: ["user", "admin", "editor", "author"], 
    default: "user" 
  },
  bio: { type: String, default: "" },
  avatar: { type: String, default: "" }
}, { timestamps: true });

// Auto-increment 'id' field
userSchema.plugin(AutoIncrement, { inc_field: 'id' });

module.exports = mongoose.model('User', userSchema);
