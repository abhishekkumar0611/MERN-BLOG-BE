const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true
    },
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag'
      },
    ],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
     mediaUrl:
      { 
        type: String, required: true
      },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
