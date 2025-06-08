const express = require('express');
const multer = require('multer');
const Image = require('../models/Image');
const DetectionLog = require('../models/DetectionLog');
const { auth } = require('../middleware/auth');
const ImageProcessor = require('../utils/imageProcessor');

const router = express.Router();

// Configure multer for detection uploads
const upload = multer({
  dest: 'temp/',
  limits: { fileSize: 50 * 1024 * 1024 }
});

// Detect image similarity
router.post('/check', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    // Generate hashes for uploaded image
    const suspectedHashes = await ImageProcessor.generateHashes(req.file.path);
    
    // Find similar images in database
    const userImages = await Image.find({ owner: req.user.id });
    const results = [];

    for (const originalImage of userImages) {
      const similarity = ImageProcessor.compareImages(
        originalImage.hash.perceptualHash,
        suspectedHashes.perceptualHash
      );

      if (similarity > 0.8) { // 80% similarity threshold
        results.push({
          originalImage: originalImage._id,
          similarity,
          verdict: similarity > 0.95 ? 'original' : 'modified'
        });
      }
    }

    // Clean up temp file
    const fs = require('fs');
    fs.unlinkSync(req.file.path);

    res.json({
      results,
      message: results.length > 0 ? 'Similar images found' : 'No matches found'
    });

  } catch (error) {
    console.error('Detection error:', error);
    res.status(500).json({ error: 'Detection failed' });
  }
});

// Get detection history
router.get('/history', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const logs = await DetectionLog.find()
      .populate('originalImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await DetectionLog.countDocuments();

    res.json({
      logs,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

module.exports = router;