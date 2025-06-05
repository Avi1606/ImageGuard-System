const express = require('express');
const multer = require('multer');
const Image = require('../models/Image');
const DetectionLog = require('../models/DetectionLog');
const { auth } = require('../middleware/auth');
const AdvancedImageProcessor = require('../utils/advancedImageProcessor');

const router = express.Router();
const upload = multer({ dest: 'temp/' });
const advancedProcessor = new AdvancedImageProcessor();

// Advanced CNN-based similarity detection
router.post('/cnn-detect', auth, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image provided' });
        }

        // Generate CNN hash for uploaded image
        const cnnHash = await advancedProcessor.generateCNNHash(req.file.path);

        // Search for similar images using FAISS
        const searchResults = await advancedProcessor.searchSimilarImages(
            req.file.path,
            0.7 // Lower threshold for more sensitive detection
        );

        // Process results and calculate tamper scores
        const processedResults = searchResults.matches.map(match => {
            const tamperScore = advancedProcessor.calculateTamperScore(match.similarity_score);
            return {
                ...match,
                tamperScore
            };
        });

        // Create detection log
        const detectionLog = new DetectionLog({
            suspectedImage: {
                filename: req.file.filename,
                path: req.file.path,
                hash: {
                    cnnHash: cnnHash.hash_vector
                }
            },
            detectionResults: {
                similarity: searchResults.highest_similarity,
                confidence: searchResults.highest_similarity,
                verdict: searchResults.total_matches > 0 ? 'modified' : 'original'
            },
            analysis: {
                modifications: [], // Would be determined by ML model
                watermarkPresent: false, // Would be detected by model
                suspiciousPatterns: []
            },
            reportedBy: req.user.id,
            source: 'cnn-detection'
        });

        await detectionLog.save();

        // Clean up temp file
        const fs = require('fs');
        fs.unlinkSync(req.file.path);

        res.json({
            success: true,
            results: {
                totalMatches: searchResults.total_matches,
                highestSimilarity: searchResults.highest_similarity,
                matches: processedResults,
                overallTamperScore: processedResults.length > 0
                    ? processedResults[0].tamperScore
                    : advancedProcessor.calculateTamperScore(0),
                detectionId: detectionLog._id
            }
        });

    } catch (error) {
        console.error('CNN Detection error:', error);
        res.status(500).json({
            error: 'Advanced detection failed',
            details: error.message
        });
    }
});

// Get tamper score for specific comparison
router.post('/tamper-score', auth, async (req, res) => {
    try {
        const { originalImageId, suspectedImagePath } = req.body;

        const originalImage = await Image.findById(originalImageId);
        if (!originalImage || originalImage.owner.toString() !== req.user.id) {
            return res.status(404).json({ error: 'Original image not found' });
        }

        // Compare using CNN
        const searchResults = await advancedProcessor.searchSimilarImages(
            suspectedImagePath,
            0.1 // Very low threshold to get any match
        );

        const tamperScore = advancedProcessor.calculateTamperScore(
            searchResults.highest_similarity || 0
        );

        res.json({
            tamperScore,
            comparisonDetails: {
                originalImage: originalImage._id,
                similarity: searchResults.highest_similarity || 0,
                matches: searchResults.total_matches || 0
            }
        });

    } catch (error) {
        console.error('Tamper score error:', error);
        res.status(500).json({ error: 'Failed to calculate tamper score' });
    }
});

// Bulk image analysis
router.post('/bulk-analyze', auth, upload.array('images', 50), async (req, res) => {
    try {
        const results = [];

        for (const file of req.files) {
            try {
                const searchResults = await advancedProcessor.searchSimilarImages(file.path);
                const tamperScore = advancedProcessor.calculateTamperScore(
                    searchResults.highest_similarity || 0
                );

                results.push({
                    filename: file.originalname,
                    tamperScore,
                    matches: searchResults.total_matches
                });

                // Clean up
                const fs = require('fs');
                fs.unlinkSync(file.path);

            } catch (error) {
                console.error(`Error processing ${file.originalname}:`, error);
                results.push({
                    filename: file.originalname,
                    error: error.message
                });
            }
        }

        res.json({
            success: true,
            totalProcessed: req.files.length,
            results
        });

    } catch (error) {
        console.error('Bulk analysis error:', error);
        res.status(500).json({ error: 'Bulk analysis failed' });
    }
});

module.exports = router;