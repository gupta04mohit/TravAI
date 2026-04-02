const mongoose = require('mongoose');

const StateSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  tagline: { type: String },
  description: { type: String },
  img: { type: String },
  category: { type: String },          // Nature, Historical, Beaches, etc.
  bestSeason: { type: String },         // Winter, Summer, Monsoon, Any
  famous: { type: String },             // "Jaipur, Udaipur, Jaisalmer"
  places: { type: Number, default: 0 },
  status: { type: String, enum: ['Published', 'Draft'], default: 'Draft' },
}, { timestamps: true });

// Auto-generate slug from name
StateSchema.pre('validate', function () {
  if (this.name && !this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
});

module.exports = mongoose.model('State', StateSchema);
