const express = require('express');
const multer = require('multer');
const Image = require('../models/Image');
const DetectionLog = require('../models/DetectionLog');
const { auth } = require('../middleware/auth');
const SimpleImageProcessor = require('../utils/simpleImageProcessor');

const router = express.Router();
const upload = multer({ dest: 'temp/' });
const processor = new SimpleImageProcessor();

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

        // Process results and calculate tamper scores
        const processedResults = searchResults.matches.map(match => {
            const tamperScore = processor.calculateTamperScore(match.similarity_score);
            return {
                ...match,
                tamperScore
            };
        });

        // Determine verdict based on results
        let verdict = 'no_match';
        if (searchResults.total_matches > 0) {
            const highestSimilarity = searchResults.highest_similarity;
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

        // Create detection log
        const detectionLog = new DetectionLog({
            suspectedImage: {
                filename: req.file.originalname || req.file.filename,
                path: req.file.path,
                hash: {
                    mlHash: hashResult.simple_hash
                }
            },
            detectionResults: {
                similarity: searchResults.highest_similarity || 0,
                confidence: searchResults.highest_similarity || 0,
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

        await detectionLog.save();

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
                highestSimilarity: searchResults.highest_similarity || 0,
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

// Add image to ML index
router.post('/add-to-index/:imageId', auth, async (req, res) => {
    try {
        const image = await Image.findById(req.params.imageId);

        if (!image || image.owner.toString() !== req.user.id) {
            return res.status(404).json({ error: 'Image not found' });
        }

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

        // Update image record
        image.status = 'indexed';
        await image.save();

        res.json({
            success: true,
            message: 'Image added to ML index',
            totalIndexed: result.total_images
        });

    } catch (error) {
        console.error('Add to index error:', error);
        res.status(500).json({
            error: 'Failed to add to index',
            details: error.message
        });
    }
});

module.exports = router;