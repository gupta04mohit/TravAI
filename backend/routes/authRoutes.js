const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { requireAuth } = require('../middleware/authMiddleware');

const DAILY_LOGIN_COINS = 10;
const STREAK_BONUS_DAY = 10; // every 10 consecutive days
const STREAK_BONUS_COINS = 120;

// Helper: format user data for frontend
const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  mobile: user.mobile || '',
  isAdmin: user.isAdmin || false,
  coins: user.coins || 0,
  lastLoginAt: user.lastLoginAt || null,
  loginStreak: user.loginStreak || 0,
  preferences: user.preferences || {},
  settings: user.settings || { language: 'en', notifications: true, emailUpdates: true },
  activePass: user.activePass && user.activePass.expiresAt > new Date()
    ? { type: user.activePass.type, expiresAt: user.activePass.expiresAt }
    : null,
  isPremium: user.isPremium || false,
  referralCode: user.referralCode || '',
});

// ─── Register ───
router.post('/register', async (req, res) => {
  try {
    const { name, email, mobile, phone, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name, email, mobile: mobile || phone || '', password: hashedPassword,
      coins: 50,
      coinHistory: [{ amount: 50, type: 'earned', reason: 'Welcome bonus' }]
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ user: formatUser(user), token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Login ───
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Daily login streak + coins reward (server-side)
    const now = new Date();
    const lastLoginAt = user.lastLoginAt ? new Date(user.lastLoginAt) : null;

    const isSameDay = lastLoginAt ? lastLoginAt.toDateString() === now.toDateString() : false;
    const dayDiff = lastLoginAt ? Math.round((now.getTime() - lastLoginAt.getTime()) / (1000 * 60 * 60 * 24)) : null;
    const isConsecutive = dayDiff === 1;

    const prevStreak = user.loginStreak || 0;
    const nextStreak = isSameDay ? prevStreak : isConsecutive ? prevStreak + 1 : 1;

    const streakBonus =
      !isSameDay && nextStreak >= STREAK_BONUS_DAY && nextStreak % STREAK_BONUS_DAY === 0 ? STREAK_BONUS_COINS : 0;
    const addedCoins = isSameDay ? 0 : DAILY_LOGIN_COINS + streakBonus;

    let updatedUser = user;
    if (addedCoins > 0) {
      updatedUser = await User.findByIdAndUpdate(
        user._id,
        {
          $inc: { coins: addedCoins },
          $push: {
            coinHistory: {
              amount: addedCoins,
              type: 'earned',
              reason: streakBonus
                ? `Daily login + streak bonus (Day ${nextStreak})`
                : 'Daily login',
            },
          },
          $set: { lastLoginAt: now, loginStreak: nextStreak },
        },
        { new: true }
      );
    } else {
      updatedUser = await User.findByIdAndUpdate(
        user._id,
        {
          $set: { lastLoginAt: now, loginStreak: nextStreak },
        },
        { new: true }
      );
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ user: formatUser(updatedUser), token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Get Profile ───
router.get('/profile', requireAuth, async (req, res) => {
  try {
    res.json({ user: formatUser(req.user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Update Profile ───
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const { name, mobile, preferences } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (mobile) updates.mobile = mobile;
    if (preferences) updates.preferences = preferences;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    res.json({ user: formatUser(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Update Settings ───
router.put('/settings', requireAuth, async (req, res) => {
  try {
    const { language, notifications, emailUpdates } = req.body;
    const settings = { ...req.user.settings };
    if (language !== undefined) settings.language = language;
    if (notifications !== undefined) settings.notifications = notifications;
    if (emailUpdates !== undefined) settings.emailUpdates = emailUpdates;

    const user = await User.findByIdAndUpdate(req.user._id, { settings }, { new: true });
    res.json({ user: formatUser(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Save Onboarding Preferences ───
router.put('/onboarding', async (req, res) => {
  try {
    const { userId, preferences } = req.body;
    const user = await User.findByIdAndUpdate(userId, { preferences }, { new: true });
    res.json({ user: formatUser(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Purchase Coins ───
const COIN_PACKAGES = {
  small: { price: 99, coins: 100 },
  medium: { price: 249, coins: 300 },
  large: { price: 499, coins: 700 },
};

router.post('/coins/purchase', requireAuth, async (req, res) => {
  try {
    const { packageId } = req.body; // 'small', 'medium', 'large'
    const pkg = COIN_PACKAGES[packageId];
    if (!pkg) return res.status(400).json({ message: 'Invalid package' });

    // In production: verify Razorpay payment here
    const user = await User.findByIdAndUpdate(req.user._id, {
      $inc: { coins: pkg.coins },
      $push: { coinHistory: { amount: pkg.coins, type: 'purchased', reason: `Purchased ${pkg.coins} coins (₹${pkg.price})` } }
    }, { new: true });

    res.json({ user: formatUser(user), purchased: pkg });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Deduct Coins (for AI features) ───
const FEATURE_COSTS = {
  itinerary: 10,
  smartPlanner: 5,
  budgetOptimizer: 8,
  hiddenGems: 3,
  exportPlan: 5,
  voiceAI: 7,
};

router.post('/coins/deduct', requireAuth, async (req, res) => {
  try {
    const { feature } = req.body;
    const cost = FEATURE_COSTS[feature];
    if (!cost) return res.status(400).json({ message: 'Unknown feature' });

    // Check if user has active pass (unlimited access)
    if (req.user.activePass && req.user.activePass.expiresAt > new Date()) {
      return res.json({ user: formatUser(req.user), deducted: 0, hasPass: true });
    }

    if (req.user.coins < cost) {
      return res.status(402).json({ message: 'Not enough coins', required: cost, current: req.user.coins });
    }

    const user = await User.findByIdAndUpdate(req.user._id, {
      $inc: { coins: -cost },
      $push: { coinHistory: { amount: -cost, type: 'spent', reason: `Used ${feature}` } }
    }, { new: true });

    res.json({ user: formatUser(user), deducted: cost });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Purchase Pass ───
const PASS_DURATIONS = {
  daily: { price: 49, days: 1 },
  weekly: { price: 149, days: 7 },
  monthly: { price: 199, days: 30 },
};

router.post('/pass/purchase', requireAuth, async (req, res) => {
  try {
    const { passType } = req.body; // 'daily', 'weekly', 'monthly'
    const pass = PASS_DURATIONS[passType];
    if (!pass) return res.status(400).json({ message: 'Invalid pass type' });

    // In production: verify Razorpay payment here
    const now = new Date();
    const expiresAt = new Date(now.getTime() + pass.days * 24 * 60 * 60 * 1000);

    const user = await User.findByIdAndUpdate(req.user._id, {
      activePass: { type: passType, purchasedAt: now, expiresAt },
      isPremium: true,
    }, { new: true });

    res.json({ user: formatUser(user), pass: { type: passType, expiresAt } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Coin History ───
router.get('/coins/history', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ history: user.coinHistory || [], balance: user.coins });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Forgot password ───
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email });

    // Avoid email enumeration: always respond with success message.
    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      user.passwordResetToken = resetToken;
      user.passwordResetExpires = resetExpires;
      await user.save();

      // In production: send email with reset token link.
      console.log(`[Password Reset] Token for ${email}: ${resetToken}`);
    }

    res.json({ message: 'If the account exists, a reset link has been sent.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Reset password ───
router.post('/reset-password', async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;
    if (!email || !token || !newPassword) return res.status(400).json({ message: 'Email, token and new password are required' });
    if (newPassword.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid reset request' });

    if (!user.passwordResetToken || !user.passwordResetExpires) {
      return res.status(400).json({ message: 'Reset token expired' });
    }

    const isValidToken = user.passwordResetToken === token && user.passwordResetExpires > new Date();
    if (!isValidToken) return res.status(400).json({ message: 'Invalid or expired token' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Legacy profile route (keep backward compat) ───
router.get('/profile/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(formatUser(user));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
