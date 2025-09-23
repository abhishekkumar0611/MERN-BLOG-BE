const express = require('express');
const router = express.Router();
const { mediaUpload } = require('../middleware/multerMiddleware');

const {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  getPostsByCategory,
  getPostsByTag,
  searchPost,
  getTrendingPosts
} = require('../controllers/postController');

const { verifyUser } = require('../middleware/auth');

// Public routes
router.get('/', getPosts);
router.get('/category/:categoryId', getPostsByCategory);
router.get('/tag/:tagId', getPostsByTag);
router.get('/search', searchPost);
router.get('/trending', getTrendingPosts);
router.get('/:id', getPostById);

// Protected routes (need authentication)
router.post('/', verifyUser, mediaUpload.single('media'), createPost);

router.put("/:id", verifyUser, mediaUpload.single('media'), updatePost);


router.delete('/:id', verifyUser, deletePost);
router.put('/:id/like', verifyUser, likePost);
router.put('/:id/unlike', verifyUser, unlikePost);

module.exports = router;
