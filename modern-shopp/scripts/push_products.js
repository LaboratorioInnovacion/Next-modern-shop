const axios = require('axios');
const fs = require('fs');

// Cambia la URL si tu API corre en otro puerto o ruta
const API_URL = 'http://localhost:3000/api/products';
const FILE_PATH = './productos-droppers.json';

async function pushProducts() {
  let products = [];
  try {
    products = JSON.parse(fs.readFileSync(FILE_PATH, 'utf-8'));
  } catch (err) {
    console.error('No se pudo leer el archivo JSON:', err.message);
    return;
  }

  let count = 0;
  for (const product of products) {
    // Solo pushea si tiene nombre y precio
    if (!product.name || !product.price) continue;
    try {
      const res = await axios.post(API_URL, product);
      count++;
      console.log(`✔️ Producto insertado: ${product.name}`);
    } catch (err) {
      console.error(`❌ Error insertando ${product.name}:`, err.response?.data || err.message);
    }
  }
  console.log(`\nTotal insertados: ${count}`);
}

pushProducts();
