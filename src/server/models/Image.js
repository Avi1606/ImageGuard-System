const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  originalName: {
    type: String,
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  dimensions: {
    width: Number,
    height: Number
  },
  hash: {
    perceptualHash: String,
    differenceHash: String,
    averageHash: String,
    md5Hash: String,
    mlHash: String,
    cnnHash: [Number]
  },
  watermark: {
    isWatermarked: {
      type: Boolean,
      default: false
    },
    watermarkText: String,
    watermarkPosition: {
      type: String,
      enum: ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center'],
      default: 'bottom-right'
    },
    opacity: {
      type: Number,
      min: 0.1,
      max: 1.0,
      default: 0.3
    },
    watermarkedPath: String
  },
  status: {
    type: String,
    enum: [
      'uploaded',     // Just uploaded
      'processing',   // Being processed
      'indexed',      // Added to ML search index
      'protected',    // Has watermark
      'archived',     // Archived
      'failed'        // Processing failed
    ],
    default: 'uploaded'
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  metadata: {
    camera: String,
    location: String,
    description: String,
    tags: [String]
  },
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    downloads: {
      type: Number,
      default: 0
    },
    lastAccessed: Date
  },
  mlIndex: {
    isIndexed: {
      type: Boolean,
      default: false
    },
    indexedAt: Date,
    features: [Number], // ML feature vector
    searchableHash: String
  }
}, {
  timestamps: true
});

// Index for faster queries
imageSchema.index({ owner: 1, status: 1 });
imageSchema.index({ 'mlIndex.isIndexed': 1 });

module.exports = mongoose.model('Image', imageSchema);