const express = require("express");
const router = express.Router();

const {
     createComment, 
     getCommentsByPost, 
     updateComment, 
     deleteComment } = require('../controllers/commentController');

const { verifyUser } = require('../middleware/auth'); 


router.post('/', verifyUser, createComment);
router.get('/:postId', getCommentsByPost);
router.put('/:id', verifyUser, updateComment);
router.delete('/:id', verifyUser, deleteComment);

module.exports = router;