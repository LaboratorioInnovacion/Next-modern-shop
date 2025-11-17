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
                { timeout: 15000 }
              );
            } catch (e) {
              // no bloqueamos si falla la espera; seguimos recogiendo lo que haya
            }

            // Intentar recorrer el carrusel (thumbnails + flechas) para forzar carga de imágenes de mayor resolución
            try {
              // esperar al contenedor fotorama
              await prodPage.waitForSelector('.fotorama', { timeout: 9000 });
              // intentar forzar inicialización si no está lista y luego usar su API para mostrar cada frame
              const thumbCount = await prodPage.$$eval('.fotorama__nav__frame', els => els.length).catch(() => 0);
              const loops = Math.max(thumbCount, 3);

              for (let i = 0; i < loops; i++) {
                try {
                  // Usar la API de fotorama si está disponible: api.show(i)
                  await prodPage.evaluate((idx) => {
                    try {
                      const $ = window.jQuery;
                      if ($) {
                        const $f = $('.fotorama');
                        if ($f && $f.length) {
                          let api = $f.data && $f.data('fotorama');
                          if ((!api || !api.data) && $.fn && $.fn.fotorama) {
                            try { $f.fotorama(); api = $f.data('fotorama'); } catch (e) {}
                          }
                          if (api && typeof api.show === 'function') {
                            api.show(idx);
                          } else {
                            // fallback: disparar click en thumbs o en flecha next
                            const thumb = document.querySelectorAll('.fotorama__nav__frame')[idx];
                            if (thumb) thumb.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                            else {
                              const next = document.querySelector('.fotorama__arr--next');
                              if (next) next.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                            }
                          }
                        }
                      }
                      // también disparar evento mouseover en el stage para activar lazy loaders
                      const stage = document.querySelector('.fotorama__stage');
                      if (stage) stage.dispatchEvent(new Event('mouseover'));
                    } catch (e) {}
                  }, i);
                } catch (err) {
                  // ignore
                }
                // esperar a que la imagen se cargue
                await prodPage.waitForTimeout(800);
                // esperar brevemente que alguna imagen alcance naturalWidth razonable
                await prodPage.waitForFunction(
                  () => Array.from(document.images).some(img => img.complete && img.naturalWidth > 300),
                  { timeout: 2500 }
                ).catch(() => {});
              }
            } catch (e) {
              // si no hay carrusel o falla, seguir sin bloquear
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
              // Si hay más imágenes en scripts JSON (extraer explícitamente arrays "data" y preferir campo "full")
              const scripts = Array.from(document.querySelectorAll('script[type="text/x-magento-init"]'));
              scripts.forEach(script => {
                try {
                  const txt = script.innerText;
                  // buscar la primera ocurrencia de "data": [ ... ] y parsear el array de forma robusta
                  const key = '"data":';
                  let idx = txt.indexOf(key);
                  if (idx !== -1) {
                    const arrStart = txt.indexOf('[', idx);
                    if (arrStart !== -1) {
                      // encontrar cierre del array contando corchetes
                      let depth = 0;
                      let arrEnd = -1;
                      for (let i = arrStart; i < txt.length; i++) {
                        if (txt[i] === '[') depth++;
                        else if (txt[i] === ']') {
                          depth--;
                          if (depth === 0) { arrEnd = i; break; }
                        }
                      }
                      if (arrEnd !== -1) {
                        const arrStr = txt.slice(arrStart, arrEnd + 1);
                        try {
                          const arr = JSON.parse(arrStr);
                          arr.forEach(img => {
                            const url = img.full || img.img || img.thumb || null;
                            if (url && !images.includes(url)) images.push(url);
                          });
                        } catch (e) {
                          // fallback: intentar extraer urls por regex si JSON.parse falla
                          try {
                            const matches = arrStr.match(/https?:\\\/\\\/[\\\S]+?\.(?:png|jpe?g|webp)/gi);
                            if (matches) matches.forEach(m => { if (!images.includes(m)) images.push(m); });
                          } catch (e2) {}
                        }
                      }
                    }
                  }
                } catch(e){}
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

            // Intentar extraer las URLs 'full' del carrusel Fotorama usando su API (si está disponible)
            const fotoramaImgs = await prodPage.evaluate(() => {
              const out = [];
              const add = (u) => { if (u && out.indexOf(u) === -1) out.push(u); };
              try {
                const $ = window.jQuery;
                if ($) {
                  const $f = $('.fotorama');
                  let api = $f.data && $f.data('fotorama');
                  if ((!api || !api.data) && $f.length && $.fn && $.fn.fotorama) {
                    try { $f.fotorama(); api = $f.data('fotorama'); } catch (e) {}
                  }
                  if (api && api.data && Array.isArray(api.data)) {
                    api.data.forEach(d => add(d.full || d.img || d.thumb));
                  }
                }
              } catch (e) {}
              // Fallback: leer hrefs de los frames y srcs de thumbs
              try {
                document.querySelectorAll('.fotorama__stage__frame').forEach(el => add(el.getAttribute('href')));
                document.querySelectorAll('.fotorama__nav__frame img').forEach(img => add(img.currentSrc || img.src));
              } catch (e) {}
              return out;
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
            // Elegir las mejores imágenes: preferir las URLs 'full' (mayor resolución) y eliminar duplicados
            function pickBestImages(detailImgs, debugImgs, fotoramaImgs) {
              const candidates = [];
              // Priorizar imágenes provenientes de la API de Fotorama
              if (Array.isArray(fotoramaImgs)) candidates.push(...fotoramaImgs);
              if (Array.isArray(detailImgs)) candidates.push(...detailImgs);
              if (Array.isArray(debugImgs)) candidates.push(...debugImgs);
              const uniq = Array.from(new Set(candidates.filter(Boolean)));
              // Preferir URLs que contienen '/cache/f' (suelen ser las de alta resolución en Magento)
              const preferred = uniq.filter(u => /\/cache\/[a-z0-9]{2,}/i.test(u));
              const others = uniq.filter(u => !preferred.includes(u));
              preferred.sort((a,b) => b.length - a.length);
              others.sort((a,b) => b.length - a.length);
              return preferred.concat(others);
            }

            const finalImages = pickBestImages(details.images, imgsDebug, fotoramaImgs);

            // Primero intentaremos abrir las URLs candidatas (top N) en páginas nuevas
            // y medir su naturalWidth/naturalHeight (esto fuerza la carga real y detecta la resolución verdadera)
            async function probeImageSizes(urls, limit = 6) {
              const uniq = Array.from(new Set((urls || []).filter(Boolean))).slice(0, 30);
              const toProbe = uniq.slice(0, limit);
              const results = [];
              const concurrency = 3;
              for (let i = 0; i < toProbe.length; i += concurrency) {
                const batch = toProbe.slice(i, i + concurrency);
                const promises = batch.map(async (u) => {
                  let pageImg = null;
                  try {
                    const p = await browser.newPage();
                    // set small viewport — not relevant para imagenes directas
                    await p.setViewport({ width: 1200, height: 800 });
                    // intentar cargar la URL (puede ser imagen directa o página)
                    await p.goto(u, { waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {});
                    const dims = await p.evaluate(() => {
                      try {
                        if (document.images && document.images.length) {
                          const img = document.images[0];
                          return { w: img.naturalWidth || 0, h: img.naturalHeight || 0 };
                        }
                        // si no hay imagen en DOM (página html), intentar buscar meta og:image
                        const og = document.querySelector('meta[property="og:image"]');
                        if (og && og.content) return { w: 0, h: 0, url: og.content };
                        return { w: 0, h: 0 };
                      } catch (e) { return { w: 0, h: 0 }; }
                    }).catch(() => ({ w: 0, h: 0 }));
                    await p.close();
                    pageImg = { url: u, width: dims.w || 0, height: dims.h || 0 };
                  } catch (e) {
                    try { if (pageImg && pageImg.p) await pageImg.p.close(); } catch(_) {}
                    pageImg = { url: u, width: 0, height: 0 };
                  }
                  return pageImg;
                });
                const res = await Promise.all(promises);
                results.push(...res);
              }
              // Ordenar por area (mayor primero)
              results.sort((a, b) => (b.width * b.height) - (a.width * a.height));
              const ordered = results.map(r => r.url).concat(uniq.filter(u => !results.find(r => r.url === u)));
              return ordered;
            }

            let rankedImages = finalImages;
            try {
              rankedImages = await probeImageSizes(finalImages, 6);
            } catch (e) {
              // si falla el probing, mantendremos finalImages
              rankedImages = finalImages;
            }

            allProducts.push({
              name: details.name,
              description: details.longDescription || details.description,
              price,
              originalPrice,
              discount,
              image: details.image || (rankedImages.length ? rankedImages[0] : (finalImages.length ? finalImages[0] : '')),
              images: details.images && details.images.length ? details.images : (rankedImages.length ? rankedImages : finalImages),
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

