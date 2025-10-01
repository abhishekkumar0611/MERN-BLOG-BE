const Post = require('../models/postModel');
const Cloudinary = require('../config/cloudinary');
const Category = require('../models/categoryModel');
const fs = require('fs');
const mongoose = require('mongoose');
const { matchesGlob } = require('path');





exports.createPost = async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    // Validate uploaded file
    if (!req.file || !req.file.path) {
      return res.status(400).json({
        success: false,
        message: 'Media file is required',
      });
    }

    // Store relative public URL, not local path
    const imageUrl = req.file.path;

    // Validate category
    let categoryId = category;
    if (category && mongoose.Types.ObjectId.isValid(category)) {
      categoryId = new mongoose.Types.ObjectId(category);
    } else {
      let defaultCategory = await Category.findOne({ name: 'General' });
      if (!defaultCategory) {
        defaultCategory = await Category.create({ name: 'General' });
        console.log('Default "General" category created automatically.');
      }
      categoryId = defaultCategory._id;
    }

    const post = await Post.create({
      title,
      content,
      category: categoryId,
      tags: Array.isArray(tags) ? tags : tags ? [tags] : [],
      mediaUrl: imageUrl,  // <--- frontend can load this
      author: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: post,
    });

  } catch (error) {
    console.error('Create Post Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating post',
      error: error.message,
    });
  }
};




exports.getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [posts, totalPosts] = await Promise.all([
      Post.find()
        .populate("category", "name")
        .populate("tags", "name")
        .populate("author", "userName email")
        .populate({
          path: "comments", // make sure Post model has a virtual for comments
          populate: { path: "userId", select: "userName email" },
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      Post.countDocuments(),
    ]);

    res.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit),
      totalPosts,
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: error.message });
  }
};


exports.getUserPosts = async (req, res) => {
  try {
    const userId = req.user._id; // set in authMiddleware
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    // Find only posts authored by the logged-in user
    const posts = await Post.find({ author: userId })
      .populate("category", "name")
      .populate("tags", "name")
      .populate("author", "userName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments({ author: userId });

    res.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total,
    });
  } catch (err) {
    console.error("Error fetching user posts:", err);
    res.status(500).json({ message: "Server error" });
  }
}




exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'userName', 'email');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category, tags } = req.body;

    const updateData = {
      title,
      content,
      tags: Array.isArray(tags) ? tags : tags ? [tags] : [],
    };

    // Handle category (can be ObjectId or name)
    if (category) {
      if (mongoose.Types.ObjectId.isValid(category)) {
        updateData.category = category;
      } else {
        const foundCategory = await Category.findOne({ name: category.trim() });
        if (foundCategory) {
          updateData.category = foundCategory._id;
        } else {
          return res.status(400).json({
            success: false,
            message: `Category "${category}" not found. Please create it first.`,
          });
        }
      }
    }

    // Handle file update if a new image is uploaded
    if (req.file && req.file.path) {
      updateData.mediaUrl = req.file.path;
    }

    const post = await Post.findByIdAndUpdate(id, updateData, { new: true });

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    res.status(200).json({
      success: true,
      message: "Post updated successfully",
      data: post,
    });
  } catch (error) {
    console.error("Update Post Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating post",
      error: error.message,
    });
  }
};


exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Ensure only the author can delete
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Post.deleteOne({ _id: req.params.id });

    res.json({ 
      success: true,
      message: "Post removed successfully" 
    });
  } catch (error) {
    console.error("Delete Post Error:", error.message);
    res.status(500).json({ 
      success: false,
      message: "Server error while deleting post",
      error: error.message
    });
  }
};



exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.likes.some(like => like.toString() === req.user._id.toString())) {
      return res.status(400).json({ message: 'Already liked' });
    }

    post.likes.push(req.user._id);
    await post.save();

    res.json({ message: 'Post liked', likes: post.likes.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.unlikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.likes = post.likes.filter(
      likeId => likeId.toString() !== req.user._id.toString()
    );

    await post.save();
    res.json({ message: 'Post unliked', likes: post.likes.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getPostsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const posts = await Post.find({ category: categoryId })  // Assuming 'category' is a single ObjectId
      .populate("category", "name")
      .populate("tags", "name");
    res.json(posts);  // Returns an array of posts
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



exports.getPostsByTag = async (req, res) => {
  try {
    const { tagId } = req.params;
    const posts = await Post.find({ tags: tagId })  // Note: 'tags' is plural, and an array
      .populate("category", "name")
      .populate("tags", "name");
    res.json(posts);  // Returns an array of posts
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.searchPost = async( req, res) => {
  try {
    const { keyword, category, tags, sortBy, order } = req.query;

    let filter = {};

    if (keyword) {
      filter.$or = [
        { title: { $regex: keyword, $options: "i" } },  
        { content: { $regex: keyword, $options: "i" } }
      ];
    }

    if ( category) {
      filter.category = category
    }

    if ( tags) {
      filter.tags = { $in: tags.split(",") };
    }

    let sortOption = {};
    if (sortBy) {
      sortOption[sortBy] = order === "asc" ? 1 : -1; // default desc
    } else {
      sortOption["createdAt"] = -1; // default newest first
    }

    const posts = await Post.find(filter)
    .populate("category", "name")
    .populate("tags", "name")
    .populate("author", "name")
    .sort(sortOption);

    res.json(posts)
  } catch (error) {
     res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.getTrendingPosts = async( req, res) => {
  try {
    const posts = await Post.find()
    .populate("category", "name")
    .populate("author", "name")
    .populate("tags", "name")
    .sort({"likes.length" : -1})
    .limit(5);

    res.json(posts)
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
}; 