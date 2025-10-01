const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const userSchema = new mongoose.Schema(
  {
    // Auto-incremented numeric ID
    id: {
      type: Number,
      unique: true,
    },
    userName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true, // normalize emails
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin", "editor", "author"],
      default: "user",
    },
    profile: {
      type: String,
      default: "",
    },
    // avatar: { type: String, default: "" } // optional field if you add profile picture
  },
  { timestamps: true }
);

// Auto-increment plugin for "id" field
userSchema.plugin(AutoIncrement, { inc_field: "id" });

module.exports = mongoose.model("User", userSchema);
