const Post = require("../models/postModel");
const Category = require("../models/categoryModel");
const mongoose = require("mongoose");
const { mediaUpload } = require("../middleware/multerMiddleware");

// Create Post
exports.createPost = async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;

    if (!title || !content) {
      return res
        .status(400)
        .json({ message: "Title and content are required" });
    }

    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: "Media file is required" });
    }

    let categoryId = category;
    if (category && mongoose.Types.ObjectId.isValid(category)) {
      categoryId = new mongoose.Types.ObjectId(category);
    } else {
      let defaultCategory = await Category.findOne({ name: "General" });
      if (!defaultCategory) {
        defaultCategory = await Category.create({ name: "General" });
      }
      categoryId = defaultCategory._id;
    }

    const post = await Post.create({
      title,
      content,
      category: categoryId,
      tags: Array.isArray(tags) ? tags : tags ? [tags] : [],
      mediaUrl: req.file.path,
      author: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      data: post,
    });
  } catch (error) {
    console.error("Create Post Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Get all posts with pagination
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
          path: "comments",
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

// Get posts by logged-in user
exports.getUserPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      Post.find({ author: userId })
        .populate("category", "name")
        .populate("tags", "name")
        .populate("author", "userName email")
        .populate({
          path: "comments",
          populate: { path: "userId", model: 'User', select: "userName email" },
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Post.countDocuments({ author: userId }),
    ]);

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
};

// Get single post by ID
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "userName email")
      .populate("category", "name")
      .populate("tags", "name");

    if (!post) return res.status(404).json({ message: "Post not found" });

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update post
exports.updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category, tags } = req.body;

    const updateData = {
      title,
      content,
      tags: Array.isArray(tags) ? tags : tags ? [tags] : [],
    };

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
            message: `Category "${category}" not found.`,
          });
        }
      }
    }

    if (req.file && req.file.path) updateData.mediaUrl = req.file.path;

    const post = await Post.findByIdAndUpdate(id, updateData, { new: true });
    if (!post)
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });

    res
      .status(200)
      .json({ success: true, message: "Post updated", data: post });
  } catch (error) {
    console.error("Update Post Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Delete post
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.author.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    await Post.deleteOne({ _id: req.params.id });
    res.json({ success: true, message: "Post deleted successfully" });
  } catch (error) {
    console.error("Delete Post Error:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Like a post
exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.likes.includes(req.user._id.toString()))
      return res.status(400).json({ message: "Already liked" });

    post.likes.push(req.user._id);
    await post.save();

    res.json({ message: "Post liked", likes: post.likes.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Unlike a post
exports.unlikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.likes = post.likes.filter(
      (like) => like.toString() !== req.user._id.toString()
    );
    await post.save();

    res.json({ message: "Post unliked", likes: post.likes.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Posts by category
exports.getPostsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const posts = await Post.find({ category: categoryId })
      .populate("category", "name")
      .populate("tags", "name")
      .populate("author", "userName email");

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Posts by tag
exports.getPostsByTag = async (req, res) => {
  try {
    const { tagId } = req.params;
    const posts = await Post.find({ tags: tagId })
      .populate("category", "name")
      .populate("tags", "name")
      .populate("author", "userName email");

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Search posts
exports.searchPost = async (req, res) => {
  try {
    const { keyword, category, tags } = req.query;
    let filter = {};

    if (keyword) {
      filter.$or = [
        { title: { $regex: keyword, $options: "i" } },
        { content: { $regex: keyword, $options: "i" } },
      ];
    }
    if (category) filter.category = category;
    if (tags) filter.tags = { $in: tags.split(",") };

    const posts = await Post.find(filter)
      .populate("category", "name")
      .populate("tags", "name")
      .populate("author", "userName email")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Trending posts (most likes)
exports.getTrendingPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("category", "name")
      .populate("tags", "name")
      .populate("author", "userName email")
      .sort({ likes: -1 })
      .limit(5);

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
