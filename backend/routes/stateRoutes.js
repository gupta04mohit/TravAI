const express = require('express');
const router = express.Router();
const State = require('../models/State');
const Place = require('../models/Place');

// Get all published states
router.get('/', async (req, res) => {
  try {
    const { search, category, season } = req.query;
    let query = { status: 'Published' };
    if (search) query.name = { $regex: search, $options: 'i' };
    if (category && category !== 'All') query.category = category;
    if (season && season !== 'All') {
      query.$or = [{ bestSeason: season }, { bestSeason: 'Any' }];
    }
    const states = await State.find(query).sort({ name: 1 });
    res.json(states);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single state by slug with its places
router.get('/:slug', async (req, res) => {
  try {
    const state = await State.findOne({ slug: req.params.slug });
    if (!state) return res.status(404).json({ message: 'State not found' });

    // Get all published places for this state
    const places = await Place.find({ state: state.name, status: 'Published' }).sort({ rating: -1 });

    res.json({ state, places });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
