const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String },
  password: { type: String },
  googleId: { type: String },

  // Role
  isAdmin: { type: Boolean, default: false },

  // Onboarding Preferences
  preferences: {
    travelType: { type: String, enum: ['solo', 'couple', 'family', 'friends'] },
    budget: { type: String, enum: ['low', 'medium', 'luxury'] },
    interests: [{ type: String }],
    season: [{ type: String }]
  },

  // Settings
  settings: {
    language: { type: String, default: 'en' },
    notifications: { type: Boolean, default: true },
    emailUpdates: { type: Boolean, default: true }
  },

  // Coins & Passes
  coins: { type: Number, default: 50 }, // 50 free coins on signup
  coinHistory: [{
    amount: Number,
    type: { type: String, enum: ['earned', 'spent', 'purchased'] },
    reason: String,
    createdAt: { type: Date, default: Date.now }
  }],

  activePass: {
    type: { type: String, enum: ['daily', 'weekly', 'monthly'] },
    purchasedAt: Date,
    expiresAt: Date
  },

  // Gamification
  isPremium: { type: Boolean, default: false },
  referralCode: { type: String },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Place' }],
  trips: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Itinerary' }]
}, { timestamps: true });

// Generate referral code on creation
UserSchema.pre('save', function () {
  if (!this.referralCode) {
    this.referralCode = this.name.slice(0, 3).toUpperCase() + Math.random().toString(36).slice(2, 7).toUpperCase();
  }
});

module.exports = mongoose.model('User', UserSchema);
