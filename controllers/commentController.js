const Comment = require('../models/commentModel');
const Post = require('../models/postModel');

// Create a comment
exports.createComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;

    const comment = await Comment.create({
      postId,
      userId: req.user._id, //comes from loggedin user
      content,
    });

    await Post.findByIdAndUpdate(postId, {
      $push: { comments: comment._id },
    });

    res.status(201).json(comment);
  } catch (err) {
    console.error("Error adding comment:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// Get comments for a post
exports.getCommentsByPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const comments = await Comment.find({ postId })
      .populate("userId", "userName email")
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (err) {
    console.error("Error fetching comments:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Update a comment
exports.updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const comment = await Comment.findOneAndUpdate(
      { _id: id, userId: req.user._id }, // only author can update
      { content },
      { new: true }
    );

    if (!comment) {
      return res.status(404).json({ message: "Comment not found or unauthorized" });
    }

    res.json(comment);
  } catch (err) {
    console.error("Error updating comment:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a comment
exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the comment with post reference
    const comment = await Comment.findById(id).populate("postId");

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Allow deletion if current user is comment author OR post author
    if (
      comment.userId.toString() !== req.user._id.toString() &&
      comment.postId.author.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Unauthorized: not your comment or post" });
    }

    // Delete the comment
    await Comment.findByIdAndDelete(id);

    // Also remove reference from Post.comments
    await Post.findByIdAndUpdate(comment.postId._id, {
      $pull: { comments: comment._id },
    });

    res.json({ message: "Comment deleted successfully" });
  } catch (err) {
    console.error("Error deleting comment:", err);
    res.status(500).json({ message: "Server error" });
  }
};
