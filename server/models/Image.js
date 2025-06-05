const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  dimensions: {
    width: Number,
    height: Number
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
      default: 0.3,
      min: 0.1,
      max: 1.0
    },
    watermarkedPath: String
  },
  hash: {
    perceptualHash: String,
    dhash: String,
    ahash: String,
    phash: String
  },
  metadata: {
    exif: mongoose.Schema.Types.Mixed,
    colorProfile: String,
    format: String
  },
  protection: {
    level: {
      type: String,
      enum: ['basic', 'standard', 'premium'],
      default: 'basic'
    },
    features: [{
      type: String,
      enum: ['watermark', 'hash', 'metadata', 'invisible-watermark']
    }]
  },
  status: {
    type: String,
    enum: ['uploaded', 'processing', 'protected', 'error'],
    default: 'uploaded'
  },
  downloads: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  tags: [String],
  description: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient querying
imageSchema.index({ owner: 1, createdAt: -1 });
imageSchema.index({ 'hash.perceptualHash': 1 });
imageSchema.index({ filename: 1 });

module.exports = mongoose.model('Image', imageSchema);