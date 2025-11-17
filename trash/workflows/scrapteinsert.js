////////////////
const puppeteer = require('puppeteer');

(async () => {
  // Permite forzar modo no-headless con la variable de entorno HEADLESS=false
  const headless = process.env.HEADLESS === 'false' ? false : true;
  const browser = await puppeteer.launch({ headless, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  try {
    const page = await browser.newPage();


    // Ir a la página de login
    console.log('Navegando a la página de login...');
    await page.goto('https://droppers.com.ar/customer/account/login', { waitUntil: 'networkidle2' });

    // Completar el formulario de login
    console.log('Completando formulario de login...');
    await page.type('input[name="login[username]"]', 'augustodelcampo97@gmail.com');
    await page.type('input[name="login[password]"]', 'Eldragon97');

    // Click en el botón de login
    console.log('Enviando formulario de login...');
    await page.click('.action.login.primary');

    // Esperar a que la navegación termine (puedes ajustar el selector según la página de destino)
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    // Verificar si el login fue exitoso
    const loginError = await page.$('.message-error');
    if (loginError) {
      const errorMsg = await page.evaluate(el => el.innerText, loginError);
      console.log('Error de login:', errorMsg);
    } else {
      console.log('Login exitoso.');
    }


    // Scraping de todas las páginas de productos

    // Control de páginas a scrapear
    const MAX_PAGES = 1; // Cambia este valor para limitar el scraping
    let currentPage = 1;
    let hasNext = true;
    const allProducts = [];

    while (hasNext && currentPage <= MAX_PAGES) {
      const url = `https://droppers.com.ar/productos.html?p=${currentPage}`;
      console.log(`Scrapeando página ${currentPage}: ${url}`);
      await page.goto(url, { waitUntil: 'networkidle2' });

      // Extraer productos de la página
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

      // Para cada producto, entrar a su página y extraer información detallada
      for (const product of products) {
        if (product.url) {
          try {
            const prodPage = await browser.newPage();
            // Mayor viewport para forzar imágenes de mayor resolución
            await prodPage.setViewport({ width: 1400, height: 900 });
            await prodPage.goto(product.url, { waitUntil: 'networkidle2' });

            // Esperar a que al menos una imagen tenga un naturalWidth razonable
            try {
              await prodPage.waitForFunction(
                () => Array.from(document.images).some(img => img.complete && img.naturalWidth > 300),
                { timeout: 8000 }
              );
            } catch (e) {
              // no bloqueamos si falla la espera; seguimos recogiendo lo que haya
            }

            // Extraer todos los campos relevantes
            const details = await prodPage.evaluate(() => {
              // Nombre
              const name = document.querySelector('.page-title .base')?.innerText?.trim() || '';
              // Precio sugerido (usado como price)
              let price = null;
              const sug = document.querySelector('.suggested-price .price');
              if (sug) {
                // Elimina puntos y comas, deja solo el separador decimal
                let clean = sug.innerText.replace(/\./g, '').replace(/,/g, '.').replace(/[^0-9.]/g, '');
                price = parseFloat(clean);
              }
              // Si no hay sugerido, fallback a price normal
              if (!price) {
                let raw = document.querySelector('meta[itemprop="price"]')?.content || document.querySelector('.price')?.innerText || '0';
                let clean = raw.replace(/\./g, '').replace(/,/g, '.').replace(/[^0-9.]/g, '');
                price = parseFloat(clean);
              }
              // originalPrice = price + 10% PORCENTAJE DE GANANCIA
              let originalPrice = price ? parseFloat((price * 1.5).toFixed(3)) : null;
              // SKU
              const sku = document.querySelector('.product.attribute.sku .value')?.innerText?.trim() || '';
              // Descripción corta
              const description = document.querySelector('.product.attribute.overview .value')?.innerText?.trim() || '';
              // Descripción larga (solo texto)
              let longDescription = '';
              const descLong = document.querySelector('#description .product.attribute.description .value');
              if (descLong) {
                longDescription = descLong.innerText?.trim() || '';
              }
              // Imágenes
              let images = [];
              const gallery = document.querySelectorAll('[data-gallery-role="gallery-placeholder"] img, .gallery-placeholder__image');
              gallery.forEach(img => {
                if (img.src && !images.includes(img.src)) images.push(img.src);
              });
              // Galería avanzada (si existe)
              if (window.Fotorama && window.Fotorama.data) {
                window.Fotorama.data.forEach(img => {
                  if (img.img && !images.includes(img.img)) images.push(img.img);
                });
              }
              // Si hay más imágenes en scripts JSON
              const scripts = Array.from(document.querySelectorAll('script[type="text/x-magento-init"]'));
              scripts.forEach(script => {
                try {
                  const txt = script.innerText;
                  if (txt.includes('gallery') && txt.includes('data')) {
                    const match = txt.match(/"data":\s*(\[.*?\])/s);
                    if (match) {
                      const arr = JSON.parse(match[1]);
                      arr.forEach(img => {
                        if (img.img && !images.includes(img.img)) images.push(img.img);
                      });
                    }
                  }
                } catch {}
              });
              // Imagen principal
              const image = images[0] || '';
              return {
                name,
                price,
                originalPrice,
                sku,
                description,
                longDescription,
                image,
                images,
              };
            });

            // DEBUG: recopilar todas las urls de imagen visibles/en atributos y sus naturalWidth
            const imgsDebug = await prodPage.evaluate(() => {
              const out = [];
              // Tomar imágenes ya presentes en DOM
              document.querySelectorAll('img').forEach(img => {
                out.push({ url: img.currentSrc || img.src || null, naturalWidth: img.naturalWidth || 0 });
                // también parsear srcset si existe
                const ss = img.getAttribute && img.getAttribute('srcset');
                if (ss) {
                  ss.split(',').forEach(s => {
                    const u = s.trim().split(' ')[0]; if (u) out.push({ url: u, naturalWidth: null });
                  });
                }
              });
              // buscar posibles imágenes en <source>
              document.querySelectorAll('source').forEach(src => {
                const ss = src.getAttribute && src.getAttribute('srcset');
                if (ss) ss.split(',').forEach(s => { const u = s.trim().split(' ')[0]; if (u) out.push({ url: u, naturalWidth: null }); });
              });
              // buscar urls dentro de scripts (Magento/Fotorama u otros)
              document.querySelectorAll('script').forEach(s => {
                try {
                  const txt = s.innerText;
                  if (txt && txt.includes('http')) {
                    const matches = txt.match(/https?:\/\/[^\s"']+/g);
                    if (matches) matches.forEach(m => out.push({ url: m, naturalWidth: null }));
                  }
                } catch (e) {}
              });
              // dedup by url
              const seen = new Set();
              return out.map(i => i.url).filter(Boolean).filter(u => { if (seen.has(u)) return false; seen.add(u); return true; }).slice(0,50);
            });

            console.log('DEBUG imágenes (top) =>', imgsDebug.slice(0,12));
            // Estructura según modelo Prisma Product
            // price se extrae tal cual, originalPrice y discount se guardan como enteros
            const price = details.price ? Math.round(details.price) : 0;
            let originalPrice = details.originalPrice !== null ? Math.round(details.originalPrice) : null;
            let discount = null;
            if (originalPrice !== null && price !== null) {
              discount = originalPrice - price;
            }
            // Si details.images está vacío intentar usar imgsDebug
            const finalImages = (details.images && details.images.length) ? details.images : imgsDebug;
            allProducts.push({
              name: details.name,
              description: details.longDescription || details.description,
              price,
              originalPrice,
              discount,
              image: details.image || (finalImages.length ? finalImages[0] : ''),
              images: details.images && details.images.length ? details.images : finalImages,
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
            });
            await prodPage.close();
          } catch (err) {
            console.log('Error extrayendo detalles de', product.url, err.message);
          }
        }
      }

      console.log(`Productos encontrados en página ${currentPage}:`, products.length);

      // Verificar si hay siguiente página
      hasNext = await page.$('.pages-item-next a') !== null;
      currentPage++;
    }

    console.log(`Total de productos scrapeados: ${allProducts.length}`);

    // Guardar en un archivo JSON
    const fs = require('fs');
    fs.writeFileSync('productos-droppers.json', JSON.stringify(allProducts, null, 2), 'utf-8');
    console.log('Archivo productos-droppers.json guardado.');
  } catch (err) {
    console.error('Error general:', err);
  } finally {
    await browser.close();
    console.log('Navegador cerrado correctamente.');
  }
})();

