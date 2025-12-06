#!/usr/bin/env node

/**
 * Script principal de scraping y sincronización
 * 
 * Uso:
 *   node scraper-main.js                    # Scrapea y sincroniza
 *   node scraper-main.js --dry-run          # Solo scrapea, guarda JSON
 *   MAX_PAGES=10 node scraper-main.js       # Scrapea 10 páginas
 */

const ProductScraper = require('./scrapers/product-scraper');
const DatabaseSync = require('./sync/database-sync');
const config = require('./config/scraper.config');

async function main() {
  const isDryRun = process.argv.includes('--dry-run');
  const scraper = new ProductScraper();
  const dbSync = new DatabaseSync();

  try {
    // Inicializar scraper
    await scraper.initialize();

    // Scrapear productos
    const products = await scraper.scrapeAll();

    // Guardar en archivo
    await dbSync.saveToFile(products);

    // Sincronizar con BD (si no es dry-run)
    if (!isDryRun && config.database.syncEnabled) {
      await dbSync.syncAll(products);
    } else if (isDryRun) {
      await dbSync.logger.log('\n⚠️  Modo DRY-RUN: No se sincronizó con la base de datos');
    }

    // Estadísticas finales
    const totalImages = products.reduce((sum, p) => sum + (p.images?.length || 0), 0);
    await dbSync.logger.log('\n' + '='.repeat(50));
    await dbSync.logger.log('🎉 PROCESO COMPLETADO');
    await dbSync.logger.log(`   📦 Productos: ${products.length}`);
    await dbSync.logger.log(`   🖼️  Imágenes: ${totalImages}`);
    await dbSync.logger.log(`   📄 Archivo: ${config.output.jsonFile}`);
    await dbSync.logger.log('='.repeat(50));

  } catch (error) {
    console.error('\n❌ ERROR FATAL:', error);
    await dbSync.logger.error('Error fatal en scraper', error);
    process.exit(1);

  } finally {
    await scraper.close();
    await dbSync.close();
  }
}

// Ejecutar
main();
