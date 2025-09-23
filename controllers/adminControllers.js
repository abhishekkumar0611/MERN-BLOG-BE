const User = require('../models/userModel');
const Post = require('../models/postModel');


exports.toggleBlockUsers = async(req, res)  => {
    try {
        const user = await User.findById(req.params.id);
        if ( !user) return res.status(400).json({ message: 'user not found'});

        user.isBlocked = !user.isBlocked;
        await user.save();

        res.json({ message: user.isBlocked ? 'user: Blocked' : 'user Unblocked'})
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.togglePostApproval = async( req, res) => {
    try {
        const post = await Post.findById(req.params.id);

       if ( !post) return res.status(400).json({  message: 'Post not found'});

       post.isApproved = !post.isApproved;
       await post.save();

        res.json({ message: post.isApproved?  'Post approved' : 'Post rejected'})
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}