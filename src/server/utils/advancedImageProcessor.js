const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

class AdvancedImageProcessor {
    constructor() {
        this.pythonScriptPath = path.join(__dirname, '../ml_models/cnn_hasher.py');
        this.modelPath = path.join(__dirname, '../ml_models/trained_model.pth');
        this.faissIndexPath = path.join(__dirname, '../ml_models/faiss_index.index');
    }

    async generateCNNHash(imagePath) {
        return new Promise((resolve, reject) => {
            const python = spawn('python', [
                this.pythonScriptPath,
                'generate_hash',
                imagePath
            ]);

            let result = '';
            let error = '';

            python.stdout.on('data', (data) => {
                result += data.toString();
            });

            python.stderr.on('data', (data) => {
                error += data.toString();
            });

            python.on('close', (code) => {
                if (code === 0) {
                    try {
                        const parsed = JSON.parse(result);
                        resolve(parsed);
                    } catch (e) {
                        reject(new Error('Failed to parse Python output'));
                    }
                } else {
                    reject(new Error(`Python script failed: ${error}`));
                }
            });
        });
    }

    async searchSimilarImages(imagePath, threshold = 0.8) {
        return new Promise((resolve, reject) => {
            const python = spawn('python', [
                this.pythonScriptPath,
                'search_similar',
                imagePath,
                threshold.toString()
            ]);

            let result = '';
            let error = '';

            python.stdout.on('data', (data) => {
                result += data.toString();
            });

            python.stderr.on('data', (data) => {
                error += data.toString();
            });

            python.on('close', (code) => {
                if (code === 0) {
                    try {
                        const parsed = JSON.parse(result);
                        resolve(parsed);
                    } catch (e) {
                        reject(new Error('Failed to parse Python output'));
                    }
                } else {
                    reject(new Error(`Python script failed: ${error}`));
                }
            });
        });
    }

    async addImageToIndex(imagePath, imageId, metadata = {}) {
        return new Promise((resolve, reject) => {
            const python = spawn('python', [
                this.pythonScriptPath,
                'add_to_index',
                imagePath,
                imageId,
                JSON.stringify(metadata)
            ]);

            let result = '';
            let error = '';

            python.stdout.on('data', (data) => {
                result += data.toString();
            });

            python.stderr.on('data', (data) => {
                error += data.toString();
            });

            python.on('close', (code) => {
                if (code === 0) {
                    try {
                        const parsed = JSON.parse(result);
                        resolve(parsed);
                    } catch (e) {
                        reject(new Error('Failed to parse Python output'));
                    }
                } else {
                    reject(new Error(`Python script failed: ${error}`));
                }
            });
        });
    }

    calculateTamperScore(similarityScore) {
        const originalityPercentage = Math.min(100, Math.round(similarityScore * 100));

        let tamperLevel, colorCode, confidence;

        if (similarityScore >= 0.95) {
            tamperLevel = "No tampering detected";
            colorCode = "green";
            confidence = "very_high";
        } else if (similarityScore >= 0.85) {
            tamperLevel = "Minor modifications";
            colorCode = "green";
            confidence = "high";
        } else if (similarityScore >= 0.70) {
            tamperLevel = "Moderate tampering";
            colorCode = "yellow";
            confidence = "medium";
        } else if (similarityScore >= 0.50) {
            tamperLevel = "Significant tampering";
            colorCode = "orange";
            confidence = "medium";
        } else {
            tamperLevel = "Heavily modified or different image";
            colorCode = "red";
            confidence = "low";
        }

        return {
            originalityPercentage,
            tamperLevel,
            colorCode,
            confidence,
            similarityScore: parseFloat(similarityScore.toFixed(4))
        };
    }
}

module.exports = AdvancedImageProcessor;