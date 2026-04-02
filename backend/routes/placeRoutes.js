const express = require('express');
const router = express.Router();
const Place = require('../models/Place');

// Get all published places (with filters)
router.get('/', async (req, res) => {
  try {
    const { budget, season, category, state, search, status } = req.query;
    const filter = {};

    // Only show published to public
    filter.status = status || 'Published';

    if (budget) filter.budgetTier = budget;
    if (season) filter.season = { $in: [season] };
    if (category) filter.categories = { $in: [category] };
    if (state) filter.state = new RegExp(state, 'i');
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
      delete filter.status; // Search across all statuses
    }

    const places = await Place.find(filter).sort({ rating: -1 });
    res.json(places);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single place by id or slug
router.get('/:idOrSlug', async (req, res) => {
  try {
    let place;
    // Try by ID first, then by slug
    if (req.params.idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      place = await Place.findById(req.params.idOrSlug);
    } else {
      place = await Place.findOne({ slug: req.params.idOrSlug });
    }
    if (!place) return res.status(404).json({ message: 'Place not found' });
    res.json(place);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add review to place
router.post('/:id/review', async (req, res) => {
  try {
    const { userId, rating, comment } = req.body;
    const place = await Place.findById(req.params.id);
    if (!place) return res.status(404).json({ message: 'Place not found' });
    place.reviews.push({ user: userId, rating, comment });
    await place.save();
    res.json(place);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
