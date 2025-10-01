const Comment = require('../models/commentModel');
const Post = require('../models/postModel')

exports.createComment = async (req, res) => {
  try {
    const { content } = req.body;
    const { postId } = req.params; 
   
    if (!postId || !content) {
      return res.status(400).json({ message: "postId and content are required" });
    }

    const newComment = await Comment.create({
      postId,
      userId: req.user._id,
      content,
    });

    const populatedComment = await newComment.populate("userId", "userName email");

    await Post.findByIdAndUpdate(postId, { $push: { comments: newComment._id } });

    res.status(201).json({
      message: "Comment created successfully",
      comment: populatedComment,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};




exports.getCommentsByPost = async( req, res) => {
    const { postId } = req.params;

    const comments = await Comment.find({ postId}).populate('userId', 'name')
    res.json(comments)

};

// Update Comment
exports.updateComment = async (req, res) => {
  try {
    const { id } = req.params; // comment id
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: "Content is required" });
    }

    const comment = await Comment.findById(id).populate("postId", "author"); // include post's author
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check permission
    const isOwner = comment.userId.toString() === req.user._id.toString();
    const isPostAuthor = comment.postId.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isPostAuthor && !isAdmin) {
      return res.status(403).json({ message: "Not authorized to update this comment" });
    }

    comment.content = content;
    await comment.save();

    res.json({ message: "Comment updated", comment });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Delete Comment
exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findById(id).populate("postId", "author");
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check permission
    const isOwner = comment.userId.toString() === req.user._id.toString();
    const isPostAuthor = comment.postId.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isPostAuthor && !isAdmin) {
      return res.status(403).json({ message: "Not authorized to delete this comment" });
    }

    await comment.deleteOne();
    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting comment", error: error.message });
  }
};

