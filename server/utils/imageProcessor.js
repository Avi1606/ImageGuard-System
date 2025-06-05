const sharp = require('sharp');
const Jimp = require('jimp');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

class ImageProcessor {
  
  // Generate perceptual hashes for image comparison
  static async generateHashes(imagePath) {
    try {
      const image = await Jimp.read(imagePath);
      
      // Generate different types of hashes
      const hashes = {
        perceptualHash: await this.generatePerceptualHash(image),
        dhash: await this.generateDHash(image),
        ahash: await this.generateAHash(image),
        phash: await this.generatePHash(image)
      };
      
      return hashes;
    } catch (error) {
      throw new Error(`Error generating hashes: ${error.message}`);
    }
  }

  // Perceptual hash (pHash) - most robust against modifications
  static async generatePerceptualHash(image) {
    const resized = image.clone().resize(32, 32).greyscale();
    const pixels = [];
    
    resized.scan(0, 0, resized.bitmap.width, resized.bitmap.height, function (x, y, idx) {
      pixels.push(this.bitmap.data[idx]);
    });
    
    // Apply DCT and generate hash
    const dctCoeffs = this.dct(pixels, 32);
    const median = this.median(dctCoeffs.slice(0, 64));
    
    let hash = '';
    for (let i = 0; i < 64; i++) {
      hash += dctCoeffs[i] > median ? '1' : '0';
    }
    
    return hash;
  }

  // Difference hash (dHash)
  static async generateDHash(image) {
    const resized = image.clone().resize(9, 8).greyscale();
    let hash = '';
    
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const pixel1 = Jimp.intToRGBA(resized.getPixelColor(x, y)).r;
        const pixel2 = Jimp.intToRGBA(resized.getPixelColor(x + 1, y)).r;
        hash += pixel1 > pixel2 ? '1' : '0';
      }
    }
    
    return hash;
  }

  // Average hash (aHash)
  static async generateAHash(image) {
    const resized = image.clone().resize(8, 8).greyscale();
    const pixels = [];
    
    resized.scan(0, 0, 8, 8, function (x, y, idx) {
      pixels.push(this.bitmap.data[idx]);
    });
    
    const average = pixels.reduce((sum, pixel) => sum + pixel, 0) / pixels.length;
    
    return pixels.map(pixel => pixel > average ? '1' : '0').join('');
  }

  // Simplified pHash implementation
  static async generatePHash(image) {
    const resized = image.clone().resize(64, 64).greyscale();
    const pixels = [];
    
    resized.scan(0, 0, 64, 64, function (x, y, idx) {
      pixels.push(this.bitmap.data[idx]);
    });
    
    // Simple average-based hash for demonstration
    const average = pixels.reduce((sum, pixel) => sum + pixel, 0) / pixels.length;
    let hash = '';
    
    for (let i = 0; i < 64; i++) {
      hash += pixels[i] > average ? '1' : '0';
    }
    
    return hash;
  }

  // Add visible watermark to image
  static async addWatermark(imagePath, watermarkText, options = {}) {
    try {
      const {
        position = 'bottom-right',
        opacity = 0.3,
        fontSize = 24,
        color = 'white'
      } = options;

      const image = sharp(imagePath);
      const metadata = await image.metadata();
      
      // Create watermark as SVG
      const watermarkSvg = this.createWatermarkSvg(
        watermarkText, 
        fontSize, 
        color, 
        opacity
      );

      // Calculate position
      const { left, top } = this.calculateWatermarkPosition(
        position, 
        metadata.width, 
        metadata.height, 
        watermarkText.length * fontSize * 0.6, 
        fontSize
      );

      const watermarkedBuffer = await image
        .composite([{
          input: Buffer.from(watermarkSvg),
          left: Math.round(left),
          top: Math.round(top)
        }])
        .jpeg({ quality: 95 })
        .toBuffer();

      // Save watermarked image
      const watermarkedPath = imagePath.replace(
        path.extname(imagePath), 
        '_watermarked' + path.extname(imagePath)
      );
      
      fs.writeFileSync(watermarkedPath, watermarkedBuffer);
      
      return watermarkedPath;
    } catch (error) {
      throw new Error(`Error adding watermark: ${error.message}`);
    }
  }

  // Create SVG watermark
  static createWatermarkSvg(text, fontSize, color, opacity) {
    const width = text.length * fontSize * 0.6;
    const height = fontSize * 1.2;
    
    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <text x="0" y="${fontSize}" 
              font-family="Arial, sans-serif" 
              font-size="${fontSize}" 
              fill="${color}" 
              opacity="${opacity}"
              font-weight="bold">
          ${text}
        </text>
      </svg>
    `;
  }

  // Calculate watermark position
  static calculateWatermarkPosition(position, imageWidth, imageHeight, watermarkWidth, watermarkHeight) {
    const margin = 20;
    
    switch (position) {
      case 'top-left':
        return { left: margin, top: margin };
      case 'top-right':
        return { left: imageWidth - watermarkWidth - margin, top: margin };
      case 'bottom-left':
        return { left: margin, top: imageHeight - watermarkHeight - margin };
      case 'bottom-right':
        return { left: imageWidth - watermarkWidth - margin, top: imageHeight - watermarkHeight - margin };
      case 'center':
        return { 
          left: (imageWidth - watermarkWidth) / 2, 
          top: (imageHeight - watermarkHeight) / 2 
        };
      default:
        return { left: imageWidth - watermarkWidth - margin, top: imageHeight - watermarkHeight - margin };
    }
  }

  // Compare two images using their hashes
  static compareImages(hash1, hash2) {
    if (hash1.length !== hash2.length) {
      return 0;
    }
    
    let matches = 0;
    for (let i = 0; i < hash1.length; i++) {
      if (hash1[i] === hash2[i]) {
        matches++;
      }
    }
    
    return matches / hash1.length;
  }

  // Calculate Hamming distance between two hashes
  static hammingDistance(hash1, hash2) {
    if (hash1.length !== hash2.length) {
      throw new Error('Hashes must be of equal length');
    }
    
    let distance = 0;
    for (let i = 0; i < hash1.length; i++) {
      if (hash1[i] !== hash2[i]) {
        distance++;
      }
    }
    
    return distance;
  }

  // Extract image metadata
  static async extractMetadata(imagePath) {
    try {
      const metadata = await sharp(imagePath).metadata();
      return {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: metadata.size,
        density: metadata.density,
        hasProfile: metadata.hasProfile,
        hasAlpha: metadata.hasAlpha,
        orientation: metadata.orientation,
        exif: metadata.exif
      };
    } catch (error) {
      throw new Error(`Error extracting metadata: ${error.message}`);
    }
  }

  // Utility functions
  static median(arr) {
    const sorted = arr.slice().sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    
    if (sorted.length % 2 === 0) {
      return (sorted[middle - 1] + sorted[middle]) / 2;
    }
    
    return sorted[middle];
  }

  // Simplified DCT implementation
  static dct(pixels, size) {
    // This is a simplified version - for production, use a proper DCT implementation
    const result = [];
    for (let i = 0; i < size; i++) {
      result.push(pixels[i] || 0);
    }
    return result;
  }
}

module.exports = ImageProcessor;