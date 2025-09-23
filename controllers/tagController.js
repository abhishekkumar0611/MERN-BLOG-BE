
const Tag = require('../models/tagModel');

exports.createTag = async (req, res) => {
  try {
    const tag = new Tag( {name: req.body.name} );
    await tag.save();
    res.status(201).json(tag);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getTags = async (req, res) => {
  try {
    const tags = await Tag.find();
    res.json(tags);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateTag = async (req, res) => {
  try {
    const tag = await Tag.findByIdAndUpdate(req.params.id,{ name: req.body.name }, { new: true });
    if (!tag) return res.status(404).json({ message: 'Tag not found' });
    res.json(tag);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteTag = async (req, res) => {
  try {
    const tag = await Tag.findByIdAndDelete(req.params.id);
    if (!tag) return res.status(404).json({ message: 'Tag not found' });
    res.json({ message: 'Tag deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
