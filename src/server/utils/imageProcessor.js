const sharp = require('sharp');
const Jimp = require('jimp');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

class ImageProcessor {
  
  // Generate perceptual hashes for image comparison
  static async generateHashes(imagePath) {
    try {
      // Refactor to use sharp for performance
      const imageBuffer = await sharp(imagePath)
        .greyscale()
        .resize(8, 8, { fit: 'fill' })
        .raw()
        .toBuffer();

      let hash = '';
      let total = 0;
      for (let i = 0; i < imageBuffer.length; i++) {
        total += imageBuffer[i];
      }
      const avg = total / imageBuffer.length;

      for (let i = 0; i < imageBuffer.length; i++) {
        hash += imageBuffer[i] > avg ? '1' : '0';
      }
      
      // Only return the hash needed for the detection feature
      return {
        perceptualHash: hash
      };

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

  // Embed a hidden code into the image using LSB steganography (fixed length, padded)
  static async embedHiddenCode(imagePath, code, outputPath) {
    try {
      const image = await Jimp.read(imagePath);
      const FIXED_LENGTH = 20; // Adjust as needed
      let paddedCode = code.padEnd(FIXED_LENGTH, '#');
      const codeBits = paddedCode.split('').map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join('');
      let bitIndex = 0;
      let finished = false;
      
      image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
        if (finished) return;
        for (let colorOffset = 0; colorOffset < 3; colorOffset++) { // R, G, B
          if (bitIndex < codeBits.length) {
            let colorValue = this.bitmap.data[idx + colorOffset];
            colorValue = (colorValue & 0xFE) | parseInt(codeBits[bitIndex]);
            this.bitmap.data[idx + colorOffset] = colorValue;
            bitIndex++;
          } else {
            finished = true;
            break;
          }
        }
      });
      // Always save as PNG for lossless embedding
      const pngOutputPath = outputPath.replace(/\.[^.]+$/, '.png');
      await image.writeAsync(pngOutputPath);
      return pngOutputPath;
    } catch (error) {
      throw new Error(`Error embedding hidden code: ${error.message}`);
    }
  }

  // Extract a hidden code from the image using LSB steganography (fixed length, padded)
  static async extractHiddenCode(imagePath, codeLength) {
    try {
      const image = await Jimp.read(imagePath);
      const FIXED_LENGTH = 20; // Must match embed
      let bits = '';
      let bitIndex = 0;
      const totalBits = FIXED_LENGTH * 8;
      let finished = false;
      
      image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
        if (finished) return;
        for (let colorOffset = 0; colorOffset < 3; colorOffset++) {
          if (bitIndex < totalBits) {
            const colorValue = this.bitmap.data[idx + colorOffset];
            bits += (colorValue & 1).toString();
            bitIndex++;
          } else {
            finished = true;
            break;
          }
        }
      });
      // Convert bits to string
      let code = '';
      for (let i = 0; i < bits.length; i += 8) {
        const byte = bits.slice(i, i + 8);
        code += String.fromCharCode(parseInt(byte, 2));
      }
      console.log('[extractHiddenCode] file:', imagePath);
      console.log('[extractHiddenCode] raw bits:', bits);
      console.log('[extractHiddenCode] code before padding removal:', code);
      console.log('[extractHiddenCode] code after padding removal:', code.replace(/#+$/, ''));
      return code.replace(/#+$/, ''); // Remove padding
    } catch (error) {
      throw new Error(`Error extracting hidden code: ${error.message}`);
    }
  }
}

module.exports = ImageProcessor;