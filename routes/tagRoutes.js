const express = require('express');

const {
    createTag,
    getTags,
    updateTag,
    deleteTag
} = require('../controllers/tagController');

const { verifyUser, verifyAdmin} = require('../middleware/auth');

const router = express.Router();

router.post('/', verifyUser, verifyAdmin, createTag);
router.get('/', getTags);
router.put('/:id', verifyUser, verifyAdmin, updateTag);
router.delete('/:id', verifyUser, verifyAdmin, deleteTag);

module.exports = router;