const express = require('express');
const multer = require('multer');
const Image = require('../models/Image');
const DetectionLog = require('../models/DetectionLog');
const { auth } = require('../middleware/auth');
const SimpleImageProcessor = require('../utils/simpleImageProcessor');

const router = express.Router();
const upload = multer({ dest: 'temp/' });
const processor = new SimpleImageProcessor();

// Utility function to clamp values between 0 and 1
const clampSimilarity = (value) => {
    if (typeof value !== 'number' || isNaN(value)) return 0;
    return Math.max(0, Math.min(1.0, value));
};

// Test Python integration
router.get('/test', async (req, res) => {
    try {
        const result = await processor.runPythonScript('test');
        res.json({
            success: true,
            message: 'Python ML integration working!',
            result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Add image to ML index
router.post('/add-to-index/:imageId', auth, async (req, res) => {
    try {
        const image = await Image.findById(req.params.imageId);

        if (!image || image.owner.toString() !== req.user.id) {
            return res.status(404).json({ error: 'Image not found' });
        }

        // Check if already indexed
        if (image.mlIndex.isIndexed) {
            return res.json({
                success: true,
                message: 'Image is already in ML index',
                alreadyIndexed: true
            });
        }

        console.log('Adding image to ML index:', image.originalName);

        // Add to ML processor index
        const result = await processor.addToIndex(
            image.path,
            image._id.toString(),
            {
                originalName: image.originalName,
                owner: req.user.id,
                uploadDate: image.createdAt
            }
        );

        if (!result.success) {
            return res.status(500).json({ error: result.error });
        }

        console.log('ML index result:', result);

        // Update image record with new structure
        image.status = 'indexed';
        image.mlIndex = {
            isIndexed: true,
            indexedAt: new Date(),
            searchableHash: result.hash || 'generated'
        };

        await image.save();

        console.log('Image updated successfully');

        res.json({
            success: true,
            message: 'Image added to ML index successfully',
            totalIndexed: result.total_images,
            imageStatus: image.status
        });

    } catch (error) {
        console.error('Add to index error:', error);
        res.status(500).json({
            error: 'Failed to add to index',
            details: error.message
        });
    }
});

// ML-based similarity detection
router.post('/ml-detect', auth, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image provided' });
        }

        console.log('Processing image:', req.file.path);

        // Generate hash for uploaded image
        const hashResult = await processor.generateHash(req.file.path);

        if (!hashResult.success) {
            return res.status(500).json({ error: hashResult.error });
        }

        console.log('Hash generated successfully');

        // Search for similar images
        const searchResults = await processor.searchSimilar(req.file.path, 0.7);

        if (!searchResults.success) {
            return res.status(500).json({ error: searchResults.error });
        }

        console.log('Search completed, matches found:', searchResults.total_matches);

        // Process results and calculate tamper scores with clamped values
        const processedResults = searchResults.matches.map(match => {
            const clampedSimilarity = clampSimilarity(match.similarity_score);
            const tamperScore = processor.calculateTamperScore(clampedSimilarity);
            return {
                ...match,
                similarity_score: clampedSimilarity,
                tamperScore
            };
        });

        // Clamp the highest similarity value
        const highestSimilarity = clampSimilarity(searchResults.highest_similarity || 0);

        // Determine verdict based on results
        let verdict = 'no_match';
        if (searchResults.total_matches > 0) {
            if (highestSimilarity >= 0.95) {
                verdict = 'original';
            } else if (highestSimilarity >= 0.85) {
                verdict = 'similar_found';
            } else if (highestSimilarity >= 0.70) {
                verdict = 'modified';
            } else {
                verdict = 'potentially_copied';
            }
        }

        console.log('Detection verdict:', verdict, 'Similarity:', highestSimilarity);

        // Create detection log with clamped values
        const detectionLog = new DetectionLog({
            suspectedImage: {
                filename: req.file.originalname || req.file.filename,
                path: req.file.path,
                hash: {
                    mlHash: hashResult.simple_hash
                }
            },
            detectionResults: {
                similarity: highestSimilarity,
                confidence: highestSimilarity,
                verdict: verdict
            },
            analysis: {
                modifications: [],
                watermarkPresent: false,
                suspiciousPatterns: [],
                tamperScore: processedResults.length > 0
                    ? processedResults[0].tamperScore
                    : processor.calculateTamperScore(0)
            },
            reportedBy: req.user.id,
            source: 'ml-detection',
            status: 'completed'
        });

        console.log('Saving detection log...');
        await detectionLog.save();
        console.log('Detection log saved successfully');

        // Clean up temp file
        const fs = require('fs');
        try {
            fs.unlinkSync(req.file.path);
        } catch (cleanupError) {
            console.error('Cleanup error:', cleanupError);
        }

        res.json({
            success: true,
            results: {
                totalMatches: searchResults.total_matches,
                highestSimilarity: highestSimilarity,
                matches: processedResults,
                overallTamperScore: processedResults.length > 0
                    ? processedResults[0].tamperScore
                    : processor.calculateTamperScore(0),
                detectionId: detectionLog._id,
                hashGenerated: hashResult.simple_hash,
                verdict: verdict
            }
        });

    } catch (error) {
        console.error('ML Detection error:', error);

        // Clean up temp file on error
        if (req.file && req.file.path) {
            const fs = require('fs');
            try {
                fs.unlinkSync(req.file.path);
            } catch (cleanupError) {
                console.error('Cleanup error:', cleanupError);
            }
        }

        res.status(500).json({
            error: 'ML detection failed',
            details: error.message
        });
    }
});

// Get ML index status
router.get('/index-status', auth, async (req, res) => {
    try {
        const totalImages = await Image.countDocuments({ owner: req.user.id });
        const indexedImages = await Image.countDocuments({
            owner: req.user.id,
            'mlIndex.isIndexed': true
        });

        res.json({
            success: true,
            stats: {
                totalImages,
                indexedImages,
                notIndexed: totalImages - indexedImages,
                indexingPercentage: totalImages > 0 ? Math.round((indexedImages / totalImages) * 100) : 0
            }
        });
    } catch (error) {
        console.error('Index status error:', error);
        res.status(500).json({
            error: 'Failed to get index status',
            details: error.message
        });
    }
});

// Bulk add images to index
router.post('/bulk-index', auth, async (req, res) => {
    try {
        const { imageIds } = req.body;

        if (!imageIds || !Array.isArray(imageIds)) {
            return res.status(400).json({ error: 'Invalid image IDs provided' });
        }

        const results = [];
        let successCount = 0;
        let errorCount = 0;

        for (const imageId of imageIds) {
            try {
                const image = await Image.findById(imageId);

                if (!image || image.owner.toString() !== req.user.id) {
                    results.push({ imageId, status: 'error', message: 'Image not found' });
                    errorCount++;
                    continue;
                }

                if (image.mlIndex.isIndexed) {
                    results.push({ imageId, status: 'skipped', message: 'Already indexed' });
                    continue;
                }

                // Add to ML index
                const result = await processor.addToIndex(
                    image.path,
                    image._id.toString(),
                    {
                        originalName: image.originalName,
                        owner: req.user.id,
                        uploadDate: image.createdAt
                    }
                );

                if (result.success) {
                    // Update image
                    image.status = 'indexed';
                    image.mlIndex = {
                        isIndexed: true,
                        indexedAt: new Date(),
                        searchableHash: result.hash || 'generated'
                    };

                    await image.save();

                    results.push({ imageId, status: 'success', message: 'Added to index' });
                    successCount++;
                } else {
                    results.push({ imageId, status: 'error', message: result.error });
                    errorCount++;
                }

            } catch (error) {
                results.push({ imageId, status: 'error', message: error.message });
                errorCount++;
            }
        }

        res.json({
            success: true,
            summary: {
                total: imageIds.length,
                successful: successCount,
                errors: errorCount,
                skipped: imageIds.length - successCount - errorCount
            },
            results
        });

    } catch (error) {
        console.error('Bulk index error:', error);
        res.status(500).json({
            error: 'Bulk indexing failed',
            details: error.message
        });
    }
});

module.exports = router;