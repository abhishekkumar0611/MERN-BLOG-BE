const Category = require('../models/categoryModel');


exports.createCategory = async (req, res) => {
  try {
    const { name} = req.body;
    if (!name ) {
      return res.status(400).json({ message: "Name is required" });
    }
    const category = new Category({ name });
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: err.message });
  }
};


exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json(categories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


exports.updateCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!category) {
            return res.status(404).json({ error: "Category not found" });
        }
        res.status(200).json(category);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};


exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) {
            return res.status(404).json({ error: "Category not found" });
        }
        res.status(200).json({ message: "Category deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
