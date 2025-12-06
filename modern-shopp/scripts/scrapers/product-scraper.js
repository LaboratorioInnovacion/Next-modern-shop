const puppeteer = require('puppeteer');
const config = require('../config/scraper.config');
const { 
  RateLimiter, 
  filterImagesByResolution,
  Logger,
  retryWithBackoff 
} = require('../utils/helpers');

class ProductScraper {
  constructor() {
    this.browser = null;
    this.page = null;
    this.rateLimiter = new RateLimiter(config.rateLimit.requestDelay);
    this.pageRateLimiter = new RateLimiter(config.rateLimit.pageDelay);
    this.logger = new Logger(config.output.logFile, config.output.errorFile);
  }

  /**
   * Inicializa el navegador y hace login
   */
  async initialize() {
    await this.logger.log('🚀 Iniciando navegador...');
    
    this.browser = await puppeteer.launch({
      headless: config.browser.headless,
      args: config.browser.args,
      executablePath: config.browser.executablePath
    });

    this.page = await this.browser.newPage();
    await this.page.setViewport(config.browser.viewport);

    await this.login();
  }

  /**
   * Realiza el login
   */
  async login() {
    await this.logger.log('🔐 Iniciando sesión...');
    
    await this.page.goto(config.credentials.loginUrl, { 
      waitUntil: 'networkidle2',
      timeout: config.browser.timeout 
    });

    await this.page.type('input[name="login[username]"]', config.credentials.email);
    await this.page.type('input[name="login[password]"]', config.credentials.password);
    await this.page.click('.action.login.primary');
    await this.page.waitForNavigation({ waitUntil: 'networkidle2' });

    const loginError = await this.page.$('.message-error');
    if (loginError) {
      throw new Error('Error de login - Verifica credenciales');
    }

    await this.logger.log('✅ Login exitoso');
  }

  /**
   * Extrae productos de una página de listado
   */
  async extractProductList(pageNumber) {
    const url = `${config.scraping.baseUrl}?p=${pageNumber}`;
    await this.logger.log(`📄 Scrapeando página ${pageNumber}: ${url}`);
    
    await this.page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: config.browser.timeout 
    });

    const products = await this.page.evaluate(() => {
      const items = [];
      document.querySelectorAll('.product-item').forEach(el => {
        const name = el.querySelector('.product-item-link')?.innerText?.trim();
        const url = el.querySelector('.product-item-link')?.href;
        if (name && url) {
          items.push({ name, url });
        }
      });
      return items;
    });

    await this.logger.log(`  ✓ ${products.length} productos encontrados`);
    return products;
  }

  /**
   * Extrae detalles de un producto individual
   */
  async extractProductDetails(productUrl) {
    const prodPage = await this.browser.newPage();
    await prodPage.setViewport(config.browser.viewport);
    
    try {
      await prodPage.goto(productUrl, { 
        waitUntil: 'networkidle2',
        timeout: config.browser.timeout 
      });

      await new Promise(resolve => setTimeout(resolve, 2000));

      // Extraer información del producto
      const details = await prodPage.evaluate(() => {
        const name = document.querySelector('.page-title .base')?.innerText?.trim() || '';
        
        // Precio
        let price = null;
        const sug = document.querySelector('.suggested-price .price');
        if (sug) {
          let clean = sug.innerText.replace(/\./g, '').replace(/,/g, '.').replace(/[^0-9.]/g, '');
          price = parseFloat(clean);
        }
        if (!price) {
          let raw = document.querySelector('meta[itemprop="price"]')?.content || 
                    document.querySelector('.price')?.innerText || '0';
          let clean = raw.replace(/\./g, '').replace(/,/g, '.').replace(/[^0-9.]/g, '');
          price = parseFloat(clean);
        }

        const sku = document.querySelector('.product.attribute.sku .value')?.innerText?.trim() || '';
        const description = document.querySelector('.product.attribute.overview .value')?.innerText?.trim() || '';
        
        let longDescription = '';
        const descLong = document.querySelector('#description .product.attribute.description .value');
        if (descLong) {
          longDescription = descLong.innerText?.trim() || '';
        }

        // Recopilar URLs de imágenes
        const imageUrls = new Set();
        
        document.querySelectorAll('[data-zoom-image], [data-full], [data-image]').forEach(el => {
          const zoom = el.getAttribute('data-zoom-image');
          const full = el.getAttribute('data-full');
          const dataImg = el.getAttribute('data-image');
          if (zoom) imageUrls.add(zoom);
          if (full) imageUrls.add(full);
          if (dataImg) imageUrls.add(dataImg);
        });
        
        document.querySelectorAll('[data-gallery-role="gallery-placeholder"] img, .gallery-placeholder__image').forEach(img => {
          if (img.src) imageUrls.add(img.src);
          if (img.currentSrc) imageUrls.add(img.currentSrc);
        });

        document.querySelectorAll('.product-image-photo, .fotorama__img, .fotorama__stage__frame img').forEach(img => {
          if (img.src) imageUrls.add(img.src);
          if (img.currentSrc) imageUrls.add(img.currentSrc);
          
          const srcset = img.getAttribute('srcset');
          if (srcset) {
            srcset.split(',').forEach(s => {
              const url = s.trim().split(' ')[0];
              if (url) imageUrls.add(url);
            });
          }
        });

        return {
          name,
          price,
          sku,
          description,
          longDescription,
          imageUrls: Array.from(imageUrls)
        };
      });

      // Filtrar imágenes
      const validImages = await filterImagesByResolution(
        details.imageUrls,
        prodPage,
        config.images.minWidth,
        config.images.minHeight
      );

      // Calcular precios
      const price = details.price ? Math.round(details.price) : 0;
      const originalPrice = details.price ? Math.round(details.price * 1.5) : null;
      const discount = originalPrice ? originalPrice - price : null;

      await prodPage.close();

      return {
        name: details.name,
        description: details.longDescription || details.description,
        price,
        originalPrice,
        discount,
        images: validImages,
        brand: 'Droppers',
        stock: 100,
        inStock: true,
        featured: false,
        sku: details.sku,
        sourceUrl: productUrl
      };

    } catch (error) {
      await prodPage.close();
      throw error;
    }
  }

  /**
   * Scrapea todas las páginas
   */
  async scrapeAll() {
    const allProducts = [];
    let currentPage = config.scraping.startPage;
    let hasNext = true;

    while (hasNext && currentPage <= config.scraping.maxPages) {
      try {
        // Rate limiting entre páginas
        if (currentPage > config.scraping.startPage) {
          await this.pageRateLimiter.wait();
        }

        const productList = await this.extractProductList(currentPage);

        // Procesar cada producto
        for (let i = 0; i < productList.length; i++) {
          const product = productList[i];
          
          await this.logger.log(`[${i + 1}/${productList.length}] ${product.name}`);

          // Rate limiting entre productos
          await this.rateLimiter.wait();

          try {
            const productData = await retryWithBackoff(
              () => this.extractProductDetails(product.url),
              config.rateLimit.maxRetries,
              config.rateLimit.retryDelay
            );

            allProducts.push(productData);
            await this.logger.log(`  ✅ Agregado (${productData.images.length} imágenes)`);

          } catch (error) {
            await this.logger.error(`Error en producto ${product.name}`, error);
          }
        }

        // Verificar si hay siguiente página
        hasNext = await this.page.$('.pages-item-next a') !== null;
        currentPage++;

      } catch (error) {
        await this.logger.error(`Error en página ${currentPage}`, error);
        break;
      }
    }

    return allProducts;
  }

  /**
   * Cierra el navegador
   */
  async close() {
    if (this.browser) {
      await this.browser.close();
      await this.logger.log('🔒 Navegador cerrado');
    }
  }
}

module.exports = ProductScraper;
