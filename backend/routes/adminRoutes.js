const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middleware/authMiddleware');
const Blog = require('../models/Blog');
const State = require('../models/State');
const Place = require('../models/Place');
const User = require('../models/User');

// All admin routes require admin authentication
router.use(requireAdmin);

/* ─── BLOGS ─── */
router.get('/blogs', async (req, res) => {
  try {
    const { search, category, sort, status } = req.query;
    let query = {};
    if (search) query.title = { $regex: search, $options: 'i' };
    if (category && category !== 'All') query.category = category;
    if (status && status !== 'All') query.status = status;
    let sortObj = { createdAt: -1 };
    if (sort === 'popular') sortObj = { views: -1 };
    if (sort === 'title') sortObj = { title: 1 };
    const blogs = await Blog.find(query).sort(sortObj);
    res.json(blogs);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/blogs', async (req, res) => {
  try {
    const blog = await Blog.create(req.body);
    if (blog.place && blog.status === 'Published') {
      await Place.findByIdAndUpdate(blog.place, { $addToSet: { blogs: blog._id } });
    }
    res.status(201).json(blog);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/blogs/:id', async (req, res) => {
  try {
    const prev = await Blog.findById(req.params.id);
    if (!prev) return res.status(404).json({ message: 'Blog not found' });

    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    // Sync place.blogs membership
    if (prev.place && prev.status === 'Published') {
      await Place.findByIdAndUpdate(prev.place, { $pull: { blogs: blog._id } });
    }
    if (blog.place && blog.status === 'Published') {
      await Place.findByIdAndUpdate(blog.place, { $addToSet: { blogs: blog._id } });
    }
    res.json(blog);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/blogs/:id', async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (blog?.place) {
      await Place.findByIdAndUpdate(blog.place, { $pull: { blogs: blog._id } });
    }
    res.json({ message: 'Blog deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

/* ─── STATES ─── */
router.get('/states', async (req, res) => {
  try {
    const states = await State.find().sort({ name: 1 });
    // For each state, count the places
    const statesWithCount = await Promise.all(states.map(async (s) => {
      const placeCount = await Place.countDocuments({ state: s.name });
      return { ...s.toObject(), places: placeCount };
    }));
    res.json(statesWithCount);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/states', async (req, res) => {
  try {
    const state = await State.create(req.body);
    res.status(201).json(state);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/states/:id', async (req, res) => {
  try {
    const state = await State.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json(state);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/states/:id', async (req, res) => {
  try {
    const state = await State.findById(req.params.id);
    if (state) {
      // Also delete all places in this state
      await Place.deleteMany({ state: state.name });
    }
    await State.findByIdAndDelete(req.params.id);
    res.json({ message: 'State and its places deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

/* ─── PLACES ─── */
router.get('/places', async (req, res) => {
  try {
    const { search, state } = req.query;
    let query = {};
    if (search) query.name = { $regex: search, $options: 'i' };
    if (state) query.state = state;
    const places = await Place.find(query).sort({ name: 1 }).lean();
    const normalized = (places || []).map((p) => ({
      ...p,
      // Normalization for frontend compatibility
      budget: p.budgetTier,
      images: p.images && p.images.length ? p.images : (p.gallery || []),
    }));
    res.json(normalized);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/places', async (req, res) => {
  try {
    const place = await Place.create(req.body);
    res.status(201).json(place);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/places/:id', async (req, res) => {
  try {
    const place = await Place.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json(place);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/places/:id', async (req, res) => {
  try {
    await Place.findByIdAndDelete(req.params.id);
    res.json({ message: 'Place deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

/* ─── PLACE GALLERY (max 10) ─── */
router.post('/places/:id/gallery', async (req, res) => {
  try {
    const { url } = req.body;
    const place = await Place.findById(req.params.id);
    if (!place) return res.status(404).json({ message: 'Place not found' });
    if ((place.gallery || []).length >= 10) {
      return res.status(400).json({ message: 'Gallery limit reached (max 10 images/videos)' });
    }
    place.gallery = [...(place.gallery || []), url];
    await place.save();
    res.json(place);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/places/:id/gallery/:index', async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);
    if (!place) return res.status(404).json({ message: 'Place not found' });
    const idx = parseInt(req.params.index);
    if (idx < 0 || idx >= (place.gallery || []).length) {
      return res.status(400).json({ message: 'Invalid gallery index' });
    }
    place.gallery.splice(idx, 1);
    await place.save();
    res.json(place);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

/* ─── USERS ─── */
router.get('/users', async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/users/:id/role', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot change your own role' });
    }
    user.isAdmin = !user.isAdmin;
    await user.save();
    res.json(user);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

/* ─── STATS ─── */
router.get('/stats', async (req, res) => {
  try {
    const [users, blogs, states, places, publishedBlogs, publishedStates, publishedPlaces, premiumUsers, totalCoinsAgg] = await Promise.all([
      User.countDocuments(),
      Blog.countDocuments(),
      State.countDocuments(),
      Place.countDocuments(),
      Blog.countDocuments({ status: 'Published' }),
      State.countDocuments({ status: 'Published' }),
      Place.countDocuments({ status: 'Published' }),
      User.countDocuments({ isPremium: true }),
      User.aggregate([{ $group: { _id: null, total: { $sum: '$coins' } } }])
    ]);
    
    const totalCoins = totalCoinsAgg[0] ? totalCoinsAgg[0].total : 0;
    
    res.json({ 
      users, blogs, states, places, 
      publishedBlogs, publishedStates, publishedPlaces,
      premiumUsers, totalCoins
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
