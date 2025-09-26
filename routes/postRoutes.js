const express = require('express');
const router = express.Router();
const { mediaUpload } = require('../middleware/multerMiddleware');

const {
  createPost,
  getUserPosts,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  getPostsByCategory,
  getPostsByTag,
  searchPost,
  getTrendingPosts,
  getPosts,
  
} = require('../controllers/postController');

const { verifyUser } = require('../middleware/auth');

// Public routes

router.get("/mine", verifyUser, getUserPosts); 
router.get("/", verifyUser, getPosts); 

router.get("/posts/:id", verifyUser, getPostById);


router.get('/category/:categoryId', getPostsByCategory);
router.get('/tag/:tagId', getPostsByTag);
router.get('/search', searchPost);
router.get('/trending', getTrendingPosts);


// Protected routes (need authentication)
router.post('/', verifyUser, mediaUpload.single('media'), createPost);

router.put("/:id", verifyUser, mediaUpload.single('media'), updatePost);

router.delete('/:id', verifyUser, deletePost);

router.put('/:id/like', verifyUser, likePost);
router.put('/:id/unlike', verifyUser, unlikePost);

module.exports = router;
