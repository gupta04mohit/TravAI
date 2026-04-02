const mongoose = require('mongoose');

const PlaceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true },
  state: { type: String, required: true },
  description: { type: String },
  tagline: { type: String },

  // Media
  images: [{ type: String }],        // Legacy field
  gallery: [{ type: String }],       // New: up to 10 photos/videos per city
  youtube: { type: String },

  // Meta tags for AI Matching and Filtering
  budgetTier: { type: String, enum: ['Budget', 'Medium', 'Luxury'], default: 'Medium' },
  season: [{ type: String }],
  categories: [{ type: String }],    // e.g. 'beaches', 'mountains'
  category: { type: String, default: 'Place' }, // Place, Accommodation, Activity, Food, Shop, Hidden Gem
  tags: [{ type: String }],

  // Display Info
  rating: { type: Number, default: 4.5 },
  estimatedCost: { type: String },
  durationNeeded: { type: String },
  bestTime: { type: String },
  safetyRating: { type: String },
  avgCost: { type: String },

  // Detailed Content
  attractions: [{
    name: { type: String },
    fee: { type: String },
    timing: { type: String }
  }],
  hotels: [{
    name: { type: String },
    price: { type: String },
    rating: { type: Number },
    tier: { type: String }
  }],
  foods: [{
    name: { type: String },
    price: { type: String },
    veg: { type: Boolean },
    famous: { type: String }
  }],
  transport: [{
    type: { type: String },
    from: { type: String },
    cost: { type: String },
    time: { type: String }
  }],
  culture: [{ type: String }],
  tips: [{ type: String }],

  // Status
  status: { type: String, enum: ['Published', 'Draft'], default: 'Draft' },

  reviews: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number },
    comment: { type: String },
    date: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

// Auto-generate slug from name
PlaceSchema.pre('validate', function () {
  if (this.name && !this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
});

module.exports = mongoose.model('Place', PlaceSchema);
