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
const mlDetectionRoutes = require('./routes/mlDetection');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: [
    process.env.CLIENT_URL,
    'https://imageguard-avi1606.vercel.app', // Replace with your actual Vercel URL
    'http://localhost:3000' // Keep for development
  ],
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

// Database connection function
const connectDB = async () => {
  try {
    console.log('🔗 Attempting to connect to MongoDB...');

    // Remove deprecated options - modern MongoDB driver doesn't need them
    await mongoose.connect(process.env.MONGODB_URI);

    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('Full error:', error);

    // Retry connection after 5 seconds
    setTimeout(connectDB, 5000);
  }
};

// Connect to database
connectDB();

// MongoDB connection event listeners
mongoose.connection.on('disconnected', () => {
  console.log('❌ MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected');
});

// Handle connection errors after initial connection
mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err.message);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/watermark', watermarkRoutes);
app.use('/api/detection', detectionRoutes);
app.use('/api/ml-detection', mlDetectionRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    python_available: true,
    mongodb_status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
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

// Improved server startup with error handling
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log('🧠 Python ML integration enabled');
  console.log(`🔗 Test Python: http://localhost:${PORT}/test-python`);
});

// Handle server errors (like port already in use)
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
    console.log('💡 Try these commands to fix:');
    console.log(`   netstat -ano | findstr :${PORT}`);
    console.log('   taskkill /PID <PID_NUMBER> /F');
    console.log(`   Or change PORT in .env file`);
    process.exit(1);
  } else {
    console.error('❌ Server error:', err);
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔄 Shutting down gracefully...');

  server.close(() => {
    console.log('✅ HTTP server closed');
  });

  try {
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
  } catch (error) {
    console.error('❌ Error closing MongoDB:', error);
  }

  process.exit(0);
});

module.exports = app;