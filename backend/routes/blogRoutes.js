const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');

// Get all published blogs (public)
router.get('/', async (req, res) => {
  try {
    const { search, category, sort } = req.query;
    let query = { status: 'Published' };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    if (category && category !== 'All') query.category = category;

    let sortObj = { createdAt: -1 };
    if (sort === 'popular') sortObj = { views: -1 };
    if (sort === 'title') sortObj = { title: 1 };

    const blogs = await Blog.find(query).sort(sortObj);
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single blog by slug (public) — increment views
router.get('/:slug', async (req, res) => {
  try {
    const blog = await Blog.findOneAndUpdate(
      { slug: req.params.slug, status: 'Published' },
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
