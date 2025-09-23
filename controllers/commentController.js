const Comment = require('../models/commentModel');

exports.createComment = async( req, res) => {
    try {
    const { postId, content } = req.body;


    if ( !postId || !content) {
        return res.status(400).json({ message: 'postId and content are required' });
    };

    const comment = await Comment.create( {
        postId,
        userId: req.user.id,
        content
    });

    res.status(201).json(comment)
 }
 catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.getCommentsByPost = async( req, res) => {
    const { postId } = req.params;

    const comments = await Comment.find({ postId}).populate('userId', 'name')
    res.json(comments)

};

exports.updateComment = async (req, res) => {
  try {
    const { id } = req.params; // comment id
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: "Content is required" });
    }

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    
    if (comment.userId.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to update this comment" });
    }

    comment.content = content;
    await comment.save();

    res.json({ message: "Comment updated", comment });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


exports.deleteComment = async(req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const isAdmin = req.user.isAdmin;

        const comment = await Comment.findById(id);
        if( !comment) return res.status(200).json({ message: 'Comment not found'});

        if (comment.userId.toString() !== userId) {
            return res.status(500).json( {message: 'You are not allowed to delete this comment' })
        }

        await Comment.deleteOne();
        res.status(201).json({ message: 'Comment deleted successfully'})
       return res.json() 
    } catch (error) {
        res.status(500).json( { message: 'Error deleting comment', error})
    }
};

