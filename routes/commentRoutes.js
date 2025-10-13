const express = require("express");
const router = express.Router();

const {
  createComment,
  getCommentsByPost,
  updateComment,
  deleteComment,
} = require("../controllers/commentController");

const { verifyUser } = require("../middleware/auth");

// Routes
router.get("/:postId", getCommentsByPost);   // get all comments for a post
router.post("/:postId", verifyUser, createComment); // add a comment to post
router.put("/:id", verifyUser, updateComment);   // update a specific comment
router.delete("/:id", verifyUser, deleteComment); // delete a specific comment

module.exports = router;
