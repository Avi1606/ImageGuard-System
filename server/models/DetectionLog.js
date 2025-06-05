const mongoose = require('mongoose');

const detectionLogSchema = new mongoose.Schema({
  originalImage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Image',
    required: false // Make this optional for cases where we're checking unknown images
  },
  suspectedImage: {
    filename: { type: String, required: true },
    path: { type: String, required: true },
    hash: {
      perceptualHash: String,
      differenceHash: String,
      averageHash: String,
      mlHash: String,
      cnnHash: [Number]
    }
  },
  detectionResults: {
    similarity: { type: Number, required: true, min: 0, max: 1 },
    confidence: { type: Number, required: true, min: 0, max: 1 },
    verdict: {
      type: String,
      enum: [
        'original',
        'modified',
        'tampered',
        'similar_found',
        'no_match',
        'unauthorized',
        'legitimate',
        'potentially_copied'
      ],
      required: true
    }
  },
  analysis: {
    modifications: [String],
    watermarkPresent: { type: Boolean, default: false },
    suspiciousPatterns: [String],
    tamperScore: {
      originalityPercentage: Number,
      tamperLevel: String,
      colorCode: String,
      confidence: String
    }
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  source: {
    type: String,
    enum: [
      'manual-upload',
      'basic-detection',
      'ml-detection',
      'cnn-detection',
      'batch-scan',
      'api-check'
    ],
    default: 'manual-upload'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('DetectionLog', detectionLogSchema);