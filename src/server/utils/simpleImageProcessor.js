const { spawn } = require('child_process');
const path = require('path');

class SimpleImageProcessor {
    constructor() {
        this.pythonScriptPath = path.join(__dirname, '../ml_models/image_processor.py');
    }

    async runPythonScript(command, args = []) {
        return new Promise((resolve, reject) => {
            const pythonArgs = [this.pythonScriptPath, command, ...args];
            const python = spawn('python', pythonArgs);

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
                        const parsed = JSON.parse(result.trim());
                        resolve(parsed);
                    } catch (e) {
                        reject(new Error(`Failed to parse Python output: ${result}`));
                    }
                } else {
                    reject(new Error(`Python script failed (code ${code}): ${error}`));
                }
            });

            python.on('error', (err) => {
                reject(new Error(`Failed to start Python process: ${err.message}`));
            });
        });
    }

    // Utility function to clamp similarity values
    clampSimilarity(value) {
        if (typeof value !== 'number' || isNaN(value)) return 0;
        return Math.max(0, Math.min(1.0, parseFloat(value.toFixed(10))));
    }

    async generateHash(imagePath) {
        try {
            return await this.runPythonScript('generate_hash', [imagePath]);
        } catch (error) {
            throw new Error(`Hash generation failed: ${error.message}`);
        }
    }

    async addToIndex(imagePath, imageId, metadata = {}) {
        try {
            return await this.runPythonScript('add_to_index', [
                imagePath,
                imageId,
                JSON.stringify(metadata)
            ]);
        } catch (error) {
            throw new Error(`Adding to index failed: ${error.message}`);
        }
    }

    async searchSimilar(imagePath, threshold = 0.8) {
        try {
            const result = await this.runPythonScript('search_similar', [
                imagePath,
                threshold.toString()
            ]);

            // Clamp all similarity values to prevent floating point precision issues
            if (result.success && result.matches) {
                result.matches = result.matches.map(match => ({
                    ...match,
                    similarity_score: this.clampSimilarity(match.similarity_score)
                }));

                if (result.highest_similarity) {
                    result.highest_similarity = this.clampSimilarity(result.highest_similarity);
                }
            }

            return result;
        } catch (error) {
            throw new Error(`Similarity search failed: ${error.message}`);
        }
    }

    calculateTamperScore(similarityScore) {
        // Ensure similarity score is properly clamped
        const clampedScore = this.clampSimilarity(similarityScore);
        const originalityPercentage = Math.min(100, Math.round(clampedScore * 100));

        let tamperLevel, colorCode, confidence;

        if (clampedScore >= 0.95) {
            tamperLevel = "No tampering detected";
            colorCode = "green";
            confidence = "very_high";
        } else if (clampedScore >= 0.85) {
            tamperLevel = "Minor modifications";
            colorCode = "green";
            confidence = "high";
        } else if (clampedScore >= 0.70) {
            tamperLevel = "Moderate tampering";
            colorCode = "yellow";
            confidence = "medium";
        } else if (clampedScore >= 0.50) {
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
            similarityScore: clampedScore
        };
    }
}

module.exports = SimpleImageProcessor;