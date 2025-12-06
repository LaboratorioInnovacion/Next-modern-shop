/**
 * Configuración del scraper
 */
module.exports = {
  // Credenciales de login
  credentials: {
    email: process.env.DROPPERS_EMAIL || 'augustodelcampo97@gmail.com',
    password: process.env.DROPPERS_PASSWORD || 'Eldragon97',
    loginUrl: 'https://droppers.com.ar/customer/account/login'
  },

  // Configuración de scraping
  scraping: {
    baseUrl: 'https://droppers.com.ar/productos.html',
    maxPages: process.env.MAX_PAGES ? parseInt(process.env.MAX_PAGES) : 5,
    startPage: 1
  },

  // Control de tráfico (rate limiting)
  rateLimit: {
    requestDelay: 2000,        // 2 segundos entre productos
    pageDelay: 5000,           // 5 segundos entre páginas
    maxRetries: 3,             // Reintentos por producto
    retryDelay: 5000,          // Delay entre reintentos
    concurrent: 1              // Procesar 1 producto a la vez
  },

  // Validación de imágenes
  images: {
    minWidth: 400,
    minHeight: 400,
    downloadEnabled: true,
    downloadPath: './public/products',
    formats: ['jpg', 'jpeg', 'png', 'webp'],
    maxSize: 5 * 1024 * 1024  // 5MB
  },

  // Puppeteer
  browser: {
    headless: process.env.HEADLESS !== 'false',
    viewport: { width: 1920, height: 1080 },
    timeout: 30000,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ],
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined
  },

  // Base de datos
  database: {
    syncEnabled: true,
    batchSize: 10,
    updateExisting: true
  },

  // Archivos de salida
  output: {
    jsonFile: './scripts/data/productos-sync.json',
    logFile: './scripts/logs/scraper.log',
    errorFile: './scripts/logs/errors.log'
  }
};
