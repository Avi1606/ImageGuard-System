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

    // Generate perceptual hash for uploaded image
    const suspectedHashes = await ImageProcessor.generateHashes(req.file.path);
    const suspectedHash = suspectedHashes.perceptualHash;

    // Find all protected images in the database
    const protectedImages = await Image.find({ status: 'protected' });
    let isOurs = false;
    let bestSimilarity = 0;
    let bestImage = null;

    for (const originalImage of protectedImages) {
      const originalHash = originalImage.hash?.perceptualHash;
      if (!originalHash) continue;
      const similarity = ImageProcessor.compareImages(originalHash, suspectedHash);
      if (similarity > bestSimilarity) {
        bestSimilarity = similarity;
        bestImage = originalImage;
      }
      if (similarity >= 0.9) {
        isOurs = true;
        break;
      }
    }

    // Clean up temp file
    const fs = require('fs');
    fs.unlinkSync(req.file.path);

    if (isOurs) {
      return res.json({
        results: [{ verdict: 'ours', message: 'This image is visually similar to a protected image.' }],
        message: 'This image is ours.'
      });
    } else {
      return res.json({
        results: [{ verdict: 'not_ours', message: 'This image is NOT visually similar to any protected image.' }],
        message: 'This image is NOT ours.'
      });
    }

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