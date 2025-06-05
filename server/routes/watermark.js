const express = require('express');
const Image = require('../models/Image');
const { auth } = require('../middleware/auth');
const ImageProcessor = require('../utils/imageProcessor');

const router = express.Router();

// Apply watermark to image
router.post('/:imageId/apply', auth, async (req, res) => {
  try {
    const { watermarkText, position, opacity } = req.body;
    
    const image = await Image.findById(req.params.imageId);
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Check ownership
    if (image.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Apply watermark
    const watermarkedPath = await ImageProcessor.addWatermark(
      image.path,
      watermarkText || req.user.username,
      { position, opacity }
    );

    // Update image record
    image.watermark = {
      isWatermarked: true,
      watermarkText: watermarkText || req.user.username,
      watermarkPosition: position || 'bottom-right',
      opacity: opacity || 0.3,
      watermarkedPath
    };
    image.status = 'protected';

    await image.save();

    res.json({
      message: 'Watermark applied successfully',
      image
    });

  } catch (error) {
    console.error('Watermark error:', error);
    res.status(500).json({ error: 'Failed to apply watermark' });
  }
});

// Get watermark preview
router.post('/preview', auth, async (req, res) => {
  try {
    const { imageId, watermarkText, position, opacity } = req.body;
    
    const image = await Image.findById(imageId);
    if (!image || image.owner.toString() !== req.user.id) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Generate preview (you would implement this)
    res.json({
      message: 'Preview generated',
      previewUrl: `/api/watermark/preview/${imageId}`
    });

  } catch (error) {
    console.error('Preview error:', error);
    res.status(500).json({ error: 'Failed to generate preview' });
  }
});

module.exports = router;