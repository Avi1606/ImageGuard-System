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
            return await this.runPythonScript('search_similar', [
                imagePath,
                threshold.toString()
            ]);
        } catch (error) {
            throw new Error(`Similarity search failed: ${error.message}`);
        }
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

module.exports = SimpleImageProcessor;