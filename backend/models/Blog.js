const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  excerpt: { type: String },
  content: { type: String },           // Markdown
  category: { type: String, enum: ['Budget', 'Couples', 'Culture', 'Food', 'Adventure', 'Seasonal', 'Spiritual', 'Guides', 'Solo'] },
  author: { type: String, default: 'TravAI Team' },
  img: { type: String },               // Featured image URL (can be uploaded)
  readTime: { type: String, default: '5 min' },
  status: { type: String, enum: ['Published', 'Draft'], default: 'Draft' },
  seoDescription: { type: String },
  views: { type: Number, default: 0 },
  tags: [{ type: String }],
}, { timestamps: true });

// Auto-generate slug from title
BlogSchema.pre('validate', function () {
  if (this.title && !this.slug) {
    this.slug = this.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
});

module.exports = mongoose.model('Blog', BlogSchema);
