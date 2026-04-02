require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Import routes
const authRoutes = require('./routes/authRoutes');
const placeRoutes = require('./routes/placeRoutes');
const aiRoutes = require('./routes/aiRoutes');
const adminRoutes = require('./routes/adminRoutes');
const stateRoutes = require('./routes/stateRoutes');
const blogRoutes = require('./routes/blogRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Simple request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/places', placeRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/states', stateRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/upload', uploadRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Unhandled Error:', err);
  if (res.headersSent) {
    return next(err)
  }
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'TravAI API is running', version: '2.0.0' });
});

// Database Connection
mongoose.set('bufferTimeoutMS', 30000);
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/travAI', {
  serverSelectionTimeoutMS: 30000, // Wait 30 seconds for server selection
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
})
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch((err) => {
    console.warn('⚠️ MongoDB connection failed — non-DB routes (AI, etc.) will still work:', err.message);
  });

// Start server regardless of DB connection
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
