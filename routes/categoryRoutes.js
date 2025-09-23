const express = require('express');
const router = express.Router();

const {
    createCategory,
    getCategories,
    updateCategory,
    deleteCategory
} = require('../controllers/categoryController');

const { verifyUser, verifyAdmin } = require('../middleware/auth');

// Only admin can create/update/delete
router.post('/', verifyUser, verifyAdmin, createCategory);
router.get('/', getCategories);
router.put('/:id', verifyUser, verifyAdmin, updateCategory);
router.delete('/:id', verifyUser, verifyAdmin, deleteCategory);

module.exports = router;
