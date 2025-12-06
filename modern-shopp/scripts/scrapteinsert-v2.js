////////////////
const puppeteer = require('puppeteer');

// Configuración de resolución mínima para filtrar thumbnails
const MIN_IMAGE_WIDTH = 400;  // Ancho mínimo en píxeles
const MIN_IMAGE_HEIGHT = 400; // Alto mínimo en píxeles

/**
 * Verifica si una imagen cumple con los requisitos mínimos de resolución
 * @param {string} imageUrl - URL de la imagen a verificar
 * @param {object} page - Página de Puppeteer
 * @returns {Promise<{url: string, width: number, height: number, isValid: boolean}>}
 */
async function validateImageResolution(imageUrl, page) {
  try {
    const dimensions = await page.evaluate((url, minWidth, minHeight) => {
      return new Promise((resolve) => {
        const img = new Image();
        const timeout = setTimeout(() => {
          resolve({ width: 0, height: 0, url: url });
        }, 5000);
        
        img.onload = function() {
          clearTimeout(timeout);
          resolve({ 
            width: this.naturalWidth, 
            height: this.naturalHeight,
            url: url
          });
        };
        img.onerror = function() {
          clearTimeout(timeout);
          resolve({ width: 0, height: 0, url: url });
        };
        img.src = url;
      });
    }, imageUrl, MIN_IMAGE_WIDTH, MIN_IMAGE_HEIGHT);

    const isValid = dimensions.width >= MIN_IMAGE_WIDTH && dimensions.height >= MIN_IMAGE_HEIGHT;
    
    return {
      url: imageUrl,
      width: dimensions.width,
      height: dimensions.height,
      isValid: isValid
    };
  } catch (error) {
    return { url: imageUrl, width: 0, height: 0, isValid: false };
  }
}

/**
 * Filtra un array de URLs de imágenes basándose en la resolución
 * @param {Array<string>} imageUrls - Array de URLs de imágenes
 * @param {object} page - Página de Puppeteer
 * @returns {Promise<Array<string>>} - URLs de imágenes válidas ordenadas por tamaño
 */
async function filterImagesByResolution(imageUrls, page) {
  if (!imageUrls || imageUrls.length === 0) return [];

  // Eliminar duplicados primero
  const uniqueUrls = Array.from(new Set(imageUrls.filter(Boolean)));
  console.log(`  Validando ${uniqueUrls.length} imágenes únicas...`);
  
  // Validar todas las imágenes en paralelo (en lotes pequeños para no saturar)
  const batchSize = 3;
  const validatedImages = [];
  
  for (let i = 0; i < uniqueUrls.length; i += batchSize) {
    const batch = uniqueUrls.slice(i, i + batchSize);
    try {
      const results = await Promise.all(
        batch.map(url => validateImageResolution(url, page))
      );
      validatedImages.push(...results);
    } catch (error) {
      console.log(`  ⚠ Error en lote ${Math.floor(i/batchSize) + 1}`);
    }
  }

  // Filtrar solo las válidas y ordenar por área (mayor a menor)
  const validImages = validatedImages
    .filter(img => img.isValid && img.width > 0 && img.height > 0)
    .sort((a, b) => (b.width * b.height) - (a.width * a.height))
    .map(img => {
      console.log(`  ✓ ${img.width}x${img.height}px`);
      return img.url;
    });

  console.log(`  Resultado: ${validImages.length}/${uniqueUrls.length} válidas (≥${MIN_IMAGE_WIDTH}x${MIN_IMAGE_HEIGHT}px)\n`);
  
  return validImages;
}

(async () => {
  const headless = process.env.HEADLESS === 'false' ? false : true;
  const browser = await puppeteer.launch({ headless, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    // Login
    console.log('Navegando a la página de login...');
    await page.goto('https://droppers.com.ar/customer/account/login', { waitUntil: 'networkidle2' });

    console.log('Completando formulario de login...');
    await page.type('input[name="login[username]"]', 'augustodelcampo97@gmail.com');
    await page.type('input[name="login[password]"]', 'Eldragon97');

    console.log('Enviando formulario de login...');
    await page.click('.action.login.primary');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    const loginError = await page.$('.message-error');
    if (loginError) {
      const errorMsg = await page.evaluate(el => el.innerText, loginError);
      console.log('Error de login:', errorMsg);
      return;
    }
    console.log('Login exitoso.\n');

    // Scraping
    const MAX_PAGES = 1;
    let currentPage = 1;
    let hasNext = true;
    const allProducts = [];

    while (hasNext && currentPage <= MAX_PAGES) {
      const url = `https://droppers.com.ar/productos.html?p=${currentPage}`;
      console.log(`\n=== Scrapeando página ${currentPage}: ${url} ===`);
      await page.goto(url, { waitUntil: 'networkidle2' });

      const products = await page.evaluate(() => {
        const items = [];
        document.querySelectorAll('.product-item').forEach(el => {
          items.push({
            name: el.querySelector('.product-item-link')?.innerText?.trim(),
            price: el.querySelector('.price')?.innerText?.trim(),
            image: el.querySelector('img.product-image-photo')?.src,
            url: el.querySelector('.product-item-link')?.href
          });
        });
        return items;
      });

      console.log(`Productos encontrados: ${products.length}\n`);

      // Procesar cada producto
      for (let idx = 0; idx < products.length; idx++) {
        const product = products[idx];
        if (!product.url) continue;

        console.log(`[${idx + 1}/${products.length}] Procesando: ${product.name}`);

        try {
          const prodPage = await browser.newPage();
          await prodPage.setViewport({ width: 1920, height: 1080 });
          await prodPage.goto(product.url, { waitUntil: 'networkidle2', timeout: 30000 });

          // Esperar a que las imágenes carguen
          await new Promise(resolve => setTimeout(resolve, 2000));

          // Extraer detalles del producto
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

            // Recopilar todas las URLs de imágenes posibles con prioridad a alta resolución
            const imageUrls = new Set();
            
            // 1. Atributos data-zoom-image y data-full (suelen ser las de mayor resolución)
            document.querySelectorAll('[data-zoom-image], [data-full], [data-image]').forEach(el => {
              const zoom = el.getAttribute('data-zoom-image');
              const full = el.getAttribute('data-full');
              const dataImg = el.getAttribute('data-image');
              if (zoom) imageUrls.add(zoom);
              if (full) imageUrls.add(full);
              if (dataImg) imageUrls.add(dataImg);
            });
            
            // 2. Imágenes de la galería principal
            document.querySelectorAll('[data-gallery-role="gallery-placeholder"] img, .gallery-placeholder__image').forEach(img => {
              if (img.src) imageUrls.add(img.src);
              if (img.currentSrc) imageUrls.add(img.currentSrc);
            });

            // 3. Todas las imágenes del producto (incluyendo Fotorama)
            document.querySelectorAll('.product-image-photo, .fotorama__img, .fotorama__stage__frame img').forEach(img => {
              if (img.src) imageUrls.add(img.src);
              if (img.currentSrc) imageUrls.add(img.currentSrc);
              
              // Capturar srcset (suele tener versiones de mayor resolución)
              const srcset = img.getAttribute('srcset');
              if (srcset) {
                srcset.split(',').forEach(s => {
                  const url = s.trim().split(' ')[0];
                  if (url) imageUrls.add(url);
                });
              }
            });
            
            // 4. Links de frames de Fotorama (suelen apuntar a imágenes full)
            document.querySelectorAll('.fotorama__stage__frame').forEach(frame => {
              const href = frame.getAttribute('href');
              if (href && (href.includes('.jpg') || href.includes('.png') || href.includes('.webp'))) {
                imageUrls.add(href);
              }
            });

            // 5. Scripts de configuración Magento/Fotorama (buscar URLs 'full')
            document.querySelectorAll('script[type="text/x-magento-init"]').forEach(script => {
              try {
                const txt = script.innerText;
                // Buscar objetos que tengan propiedad 'full'
                const fullMatches = txt.match(/"full":\s*"(https?:\/\/[^"]+)"/gi);
                if (fullMatches) {
                  fullMatches.forEach(match => {
                    const url = match.match(/"full":\s*"([^"]+)"/i);
                    if (url && url[1]) {
                      imageUrls.add(url[1].replace(/\\\//g, '/'));
                    }
                  });
                }
                
                // También buscar URLs de imágenes estándar
                const imgMatches = txt.match(/https?:\\\/\\\/[^\s"']+?\.(?:jpg|jpeg|png|webp)/gi);
                if (imgMatches) {
                  imgMatches.forEach(url => {
                    imageUrls.add(url.replace(/\\\//g, '/'));
                  });
                }
              } catch (e) {}
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

          // Filtrar imágenes por resolución
          const validImages = await filterImagesByResolution(details.imageUrls, prodPage);

          // Calcular precios
          const price = details.price ? Math.round(details.price) : 0;
          const originalPrice = details.price ? Math.round(details.price * 1.5) : null;
          const discount = originalPrice ? originalPrice - price : null;

          // Construir objeto producto
          const productData = {
            name: details.name,
            description: details.longDescription || details.description,
            price,
            originalPrice,
            discount,
            image: validImages.length > 0 ? validImages[0] : '',
            images: validImages,
            brand: '',
            stock: 100,
            inStock: true,
            featured: false,
            rating: null,
            reviews: null,
            specifications: null,
            features: [],
            sku: details.sku,
            url: product.url
          };

          allProducts.push(productData);
          console.log(`  ✓ Producto agregado con ${validImages.length} imágenes de alta resolución\n`);

          await prodPage.close();
        } catch (err) {
          console.log(`  ✗ Error procesando producto: ${err.message}\n`);
        }
      }

      hasNext = await page.$('.pages-item-next a') !== null;
      currentPage++;
    }

    console.log(`\n=== Scraping completado ===`);
    console.log(`Total de productos: ${allProducts.length}`);

    // Guardar resultados
    const fs = require('fs');
    const outputFile = 'productos-droppers-hq.json';
    fs.writeFileSync(outputFile, JSON.stringify(allProducts, null, 2), 'utf-8');
    console.log(`\n✓ Archivo guardado: ${outputFile}`);

    // Estadísticas
    const totalImages = allProducts.reduce((sum, p) => sum + (p.images?.length || 0), 0);
    const avgImages = totalImages / allProducts.length;
    console.log(`\nEstadísticas:`);
    console.log(`- Total de imágenes de alta resolución: ${totalImages}`);
    console.log(`- Promedio por producto: ${avgImages.toFixed(1)} imágenes`);
    console.log(`- Resolución mínima aplicada: ${MIN_IMAGE_WIDTH}x${MIN_IMAGE_HEIGHT}px`);

  } catch (err) {
    console.error('\n✗ Error general:', err);
  } finally {
    await browser.close();
    console.log('\n✓ Navegador cerrado correctamente.');
  }
})();
