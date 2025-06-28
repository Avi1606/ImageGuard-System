const express = require('express');
const Image = require('../models/Image');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const ImageProcessor = require('../utils/imageProcessor');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Upload new image
router.post('/upload', auth, upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const uploadedImages = [];

    for (const file of req.files) {
      try {
        // Embed hidden code (LSB steganography)
        const secretCode = 'TIMES_PROJECT_SECRET';
        const protectedPath = await ImageProcessor.embedHiddenCode(file.path, secretCode, file.path); // Now returns PNG path

        // Delete the original file if it is not PNG
        if (!file.path.endsWith('.png')) {
          try { fs.unlinkSync(file.path); } catch (e) { /* ignore */ }
        }

        // Get the PNG file size
        const protectedStats = fs.statSync(protectedPath);

        // Extract metadata
        const metadata = await ImageProcessor.extractMetadata(protectedPath);
        
        // Generate hashes
        const hashes = await ImageProcessor.generateHashes(protectedPath);

        // Create image record
        const image = new Image({
          filename: path.basename(protectedPath),
          originalName: file.originalname,
          path: protectedPath,
          size: protectedStats.size,
          mimetype: 'image/png', // Always PNG now
          dimensions: {
            width: metadata.width,
            height: metadata.height
          },
          owner: req.user.id,
          hash: hashes,
          metadata: {
            format: metadata.format,
            exif: metadata.exif
          },
          status: 'protected', // Set to protected
          watermark: {
            isWatermarked: true,
            watermarkText: secretCode
          }
        });

        await image.save();
        uploadedImages.push(image);

      } catch (error) {
        console.error(`Error processing file ${file.filename}:`, error);
        // Continue with other files
      }
    }

    if (uploadedImages.length === 0) {
      return res.status(500).json({ error: 'Failed to process any uploaded files' });
    }

    res.status(201).json({
      message: `${uploadedImages.length} image(s) uploaded successfully`,
      images: uploadedImages
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload images' });
  }
});

// Get user's images
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    const query = { owner: req.user.id };
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { originalName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const images = await Image.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('owner', 'username email');

    const total = await Image.countDocuments(query);

    res.json({
      images,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Fetch images error:', error);
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

// Get specific image
router.get('/:id', auth, async (req, res) => {
  try {
    const image = await Image.findById(req.params.id)
      .populate('owner', 'username email profile');

    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Check if user has access (owner or admin)
    if (image.owner._id.toString() !== req.user.id && req.user.role !== 'admin') {
      if (!image.isPublic) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    // Increment view count
    await Image.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    res.json({ image });

  } catch (error) {
    console.error('Fetch image error:', error);
    res.status(500).json({ error: 'Failed to fetch image' });
  }
});

// Update image metadata
router.put('/:id', auth, async (req, res) => {
  try {
    const { description, tags, isPublic } = req.body;

    const image = await Image.findById(req.params.id);
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Check ownership
    if (image.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update fields
    const updateData = { updatedAt: new Date() };
    if (description !== undefined) updateData.description = description;
    if (tags !== undefined) updateData.tags = tags;
    if (isPublic !== undefined) updateData.isPublic = isPublic;

    const updatedImage = await Image.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json({
      message: 'Image updated successfully',
      image: updatedImage
    });

  } catch (error) {
    console.error('Update image error:', error);
    res.status(500).json({ error: 'Failed to update image' });
  }
});

// Delete image
router.delete('/:id', auth, async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Check ownership
    if (image.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Delete physical files
    try {
      if (fs.existsSync(image.path)) {
        fs.unlinkSync(image.path);
      }
      if (image.watermark.watermarkedPath && fs.existsSync(image.watermark.watermarkedPath)) {
        fs.unlinkSync(image.watermark.watermarkedPath);
      }
    } catch (fileError) {
      console.error('Error deleting files:', fileError);
    }

    // Delete database record
    await Image.findByIdAndDelete(req.params.id);

    res.json({ message: 'Image deleted successfully' });

  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// Get image statistics
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await Image.aggregate([
      { $match: { owner: userId } },
      {
        $group: {
          _id: null,
          totalImages: { $sum: 1 },
          watermarkedImages: {
            $sum: { $cond: ['$watermark.isWatermarked', 1, 0] }
          },
          totalViews: { $sum: '$views' },
          totalDownloads: { $sum: '$downloads' },
          totalSize: { $sum: '$size' }
        }
      }
    ]);

    const result = stats[0] || {
      totalImages: 0,
      watermarkedImages: 0,
      totalViews: 0,
      totalDownloads: 0,
      totalSize: 0
    };

    // Get recent activity
    const recentImages = await Image.find({ owner: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('originalName createdAt status');

    res.json({
      stats: result,
      recentImages
    });

  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router;