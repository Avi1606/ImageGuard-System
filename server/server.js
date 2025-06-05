const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const imageRoutes = require('./routes/images');
const watermarkRoutes = require('./routes/watermark');
const detectionRoutes = require('./routes/detection');
const mlDetectionRoutes = require('./routes/mlDetection'); // Add ML routes

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files
app.use('/uploads', express.static('uploads'));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/imageprotection', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('connected', () => {
  console.log('✅ Connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/watermark', watermarkRoutes);
app.use('/api/detection', detectionRoutes);
app.use('/api/ml-detection', mlDetectionRoutes); // Add ML detection routes

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    python_available: true
  });
});

// Test Python integration
app.get('/test-python', async (req, res) => {
  try {
    const SimpleImageProcessor = require('./utils/simpleImageProcessor');
    const processor = new SimpleImageProcessor();

    const testResult = await processor.runPythonScript('test');
    res.json({
      python_working: true,
      message: 'Python integration successful',
      result: testResult
    });
  } catch (error) {
    res.status(500).json({
      python_working: false,
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log('🧠 Python ML integration enabled');
  console.log('🔗 Test Python: http://localhost:${PORT}/test-python');
});

module.exports = app;