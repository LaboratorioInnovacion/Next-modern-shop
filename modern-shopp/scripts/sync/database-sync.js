const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');
const config = require('../config/scraper.config');
const { downloadImage, generateImageFilename, Logger } = require('../utils/helpers');

class DatabaseSync {
  constructor() {
    this.prisma = new PrismaClient();
    this.logger = new Logger(config.output.logFile, config.output.errorFile);
  }

  /**
   * Descarga imágenes de un producto
   */
  async downloadProductImages(product) {
    if (!config.images.downloadEnabled || !product.images?.length) {
      return product.images || [];
    }

    const downloadedImages = [];
    const sku = product.sku || `product_${Date.now()}`;

    for (let i = 0; i < product.images.length; i++) {
      try {
        const imageUrl = product.images[i];
        const filename = generateImageFilename(imageUrl, i, sku);
        const localPath = await downloadImage(
          imageUrl,
          filename,
          config.images.downloadPath
        );

        // Guardar ruta relativa para la base de datos
        const relativePath = `/products/${filename}`;
        downloadedImages.push(relativePath);

        await this.logger.log(`  📥 Imagen descargada: ${filename}`);

      } catch (error) {
        await this.logger.error(`Error descargando imagen ${i} de ${product.name}`, error);
        // Mantener URL original si falla la descarga
        downloadedImages.push(product.images[i]);
      }
    }

    return downloadedImages;
  }

  /**
   * Sincroniza un producto con la base de datos
   */
  async syncProduct(product) {
    try {
      // Descargar imágenes si está habilitado
      const images = await this.downloadProductImages(product);
      const image = images[0] || '';

      // Verificar si el producto existe por SKU
      const existingProduct = product.sku 
        ? await this.prisma.product.findFirst({ where: { sku: product.sku } })
        : null;

      if (existingProduct && config.database.updateExisting) {
        // Actualizar producto existente
        const updated = await this.prisma.product.update({
          where: { id: existingProduct.id },
          data: {
            name: product.name,
            description: product.description,
            price: product.price,
            originalPrice: product.originalPrice,
            discount: product.discount,
            image,
            images,
            stock: product.stock,
            inStock: product.inStock,
            brand: product.brand
          }
        });

        await this.logger.log(`  🔄 Actualizado: ${product.name} (ID: ${updated.id})`);
        return updated;

      } else if (!existingProduct) {
        // Crear nuevo producto
        const created = await this.prisma.product.create({
          data: {
            name: product.name,
            description: product.description,
            price: product.price,
            originalPrice: product.originalPrice,
            discount: product.discount,
            image,
            images,
            brand: product.brand || '',
            stock: product.stock || 100,
            inStock: product.inStock !== false,
            featured: product.featured || false,
            sku: product.sku || null
          }
        });

        await this.logger.log(`  ✅ Creado: ${product.name} (ID: ${created.id})`);
        return created;

      } else {
        await this.logger.log(`  ⏭️  Omitido (ya existe): ${product.name}`);
        return existingProduct;
      }

    } catch (error) {
      await this.logger.error(`Error sincronizando ${product.name}`, error);
      throw error;
    }
  }

  /**
   * Sincroniza todos los productos en lotes
   */
  async syncAll(products) {
    await this.logger.log(`\n📦 Sincronizando ${products.length} productos con la base de datos...`);

    const results = {
      created: 0,
      updated: 0,
      skipped: 0,
      errors: 0
    };

    const batchSize = config.database.batchSize;
    
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      
      await this.logger.log(`\nProcesando lote ${Math.floor(i/batchSize) + 1}/${Math.ceil(products.length/batchSize)}`);

      for (const product of batch) {
        try {
          const existing = product.sku 
            ? await this.prisma.product.findFirst({ where: { sku: product.sku } })
            : null;

          await this.syncProduct(product);

          if (existing && config.database.updateExisting) {
            results.updated++;
          } else if (existing) {
            results.skipped++;
          } else {
            results.created++;
          }

        } catch (error) {
          results.errors++;
        }
      }

      // Pequeña pausa entre lotes
      if (i + batchSize < products.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    await this.logger.log('\n' + '='.repeat(50));
    await this.logger.log('📊 RESUMEN DE SINCRONIZACIÓN:');
    await this.logger.log(`   ✅ Creados: ${results.created}`);
    await this.logger.log(`   🔄 Actualizados: ${results.updated}`);
    await this.logger.log(`   ⏭️  Omitidos: ${results.skipped}`);
    await this.logger.log(`   ❌ Errores: ${results.errors}`);
    await this.logger.log('='.repeat(50));

    return results;
  }

  /**
   * Guarda productos en archivo JSON
   */
  async saveToFile(products) {
    try {
      await fs.mkdir(path.dirname(config.output.jsonFile), { recursive: true });
      await fs.writeFile(
        config.output.jsonFile,
        JSON.stringify(products, null, 2),
        'utf-8'
      );
      await this.logger.log(`\n💾 Guardado en: ${config.output.jsonFile}`);
    } catch (error) {
      await this.logger.error('Error guardando archivo JSON', error);
    }
  }

  /**
   * Cierra conexión con la base de datos
   */
  async close() {
    await this.prisma.$disconnect();
    await this.logger.log('🔒 Conexión a BD cerrada');
  }
}

module.exports = DatabaseSync;
