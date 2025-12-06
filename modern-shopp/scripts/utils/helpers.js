const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

/**
 * Utilidad para aplicar rate limiting
 */
class RateLimiter {
  constructor(delayMs) {
    this.delay = delayMs;
    this.lastRequest = 0;
  }

  async wait() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequest;
    if (timeSinceLastRequest < this.delay) {
      await new Promise(resolve => setTimeout(resolve, this.delay - timeSinceLastRequest));
    }
    this.lastRequest = Date.now();
  }
}

/**
 * Descarga una imagen y la guarda localmente
 */
async function downloadImage(url, filename, outputPath) {
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 15000,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    await fs.mkdir(outputPath, { recursive: true });
    const filepath = path.join(outputPath, filename);
    await fs.writeFile(filepath, response.data);

    return filepath;
  } catch (error) {
    throw new Error(`Error descargando imagen: ${error.message}`);
  }
}

/**
 * Genera un nombre de archivo único basado en URL
 */
function generateImageFilename(url, index, sku) {
  const ext = path.extname(new URL(url).pathname) || '.jpg';
  const timestamp = Date.now();
  return `${sku}_${index}_${timestamp}${ext}`;
}

/**
 * Valida la resolución de una imagen
 */
async function validateImageResolution(imageUrl, page, minWidth, minHeight) {
  try {
    const dimensions = await page.evaluate((url, minW, minH) => {
      return new Promise((resolve) => {
        const img = new Image();
        const timeout = setTimeout(() => resolve({ width: 0, height: 0, url }), 5000);
        
        img.onload = function() {
          clearTimeout(timeout);
          resolve({ width: this.naturalWidth, height: this.naturalHeight, url });
        };
        img.onerror = function() {
          clearTimeout(timeout);
          resolve({ width: 0, height: 0, url });
        };
        img.src = url;
      });
    }, imageUrl, minWidth, minHeight);

    const isValid = dimensions.width >= minWidth && dimensions.height >= minHeight;
    return { ...dimensions, isValid };
  } catch (error) {
    return { url: imageUrl, width: 0, height: 0, isValid: false };
  }
}

/**
 * Filtra imágenes por resolución
 */
async function filterImagesByResolution(imageUrls, page, minWidth, minHeight) {
  if (!imageUrls || imageUrls.length === 0) return [];

  const uniqueUrls = Array.from(new Set(imageUrls.filter(Boolean)));
  const validatedImages = [];
  
  // Procesar en lotes pequeños
  const batchSize = 3;
  for (let i = 0; i < uniqueUrls.length; i += batchSize) {
    const batch = uniqueUrls.slice(i, i + batchSize);
    try {
      const results = await Promise.all(
        batch.map(url => validateImageResolution(url, page, minWidth, minHeight))
      );
      validatedImages.push(...results);
    } catch (error) {
      console.log(`  ⚠ Error validando lote de imágenes`);
    }
  }

  return validatedImages
    .filter(img => img.isValid && img.width > 0 && img.height > 0)
    .sort((a, b) => (b.width * b.height) - (a.width * a.height))
    .map(img => img.url);
}

/**
 * Logger simple
 */
class Logger {
  constructor(logFile, errorFile) {
    this.logFile = logFile;
    this.errorFile = errorFile;
  }

  async log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    console.log(message);
    
    try {
      await fs.mkdir(path.dirname(this.logFile), { recursive: true });
      await fs.appendFile(this.logFile, logMessage);
    } catch (error) {
      console.error('Error escribiendo log:', error.message);
    }
  }

  async error(message, error) {
    const timestamp = new Date().toISOString();
    const errorMessage = `[${timestamp}] ERROR: ${message}\n${error?.stack || error}\n\n`;
    console.error(message, error?.message || error);
    
    try {
      await fs.mkdir(path.dirname(this.errorFile), { recursive: true });
      await fs.appendFile(this.errorFile, errorMessage);
    } catch (err) {
      console.error('Error escribiendo error log:', err.message);
    }
  }
}

/**
 * Retry con backoff exponencial
 */
async function retryWithBackoff(fn, maxRetries, baseDelay) {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

module.exports = {
  RateLimiter,
  downloadImage,
  generateImageFilename,
  filterImagesByResolution,
  Logger,
  retryWithBackoff
};
