# Scraper Profesional - Droppers

Sistema modular de scraping con sincronización automática a base de datos.

## 📁 Estructura

```
scripts/
├── scraper-main.js              # Script principal
├── config/
│   └── scraper.config.js        # Configuración centralizada
├── scrapers/
│   └── product-scraper.js       # Lógica de scraping
├── sync/
│   └── database-sync.js         # Sincronización con BD
├── utils/
│   └── helpers.js               # Utilidades
├── data/                        # JSONs generados
└── logs/                        # Logs del proceso
```

## 🚀 Uso

### Instalación
```bash
npm install puppeteer axios
```

### Ejecución básica
```bash
# Scrapea y sincroniza con BD
node scripts/scraper-main.js

# Solo scrapea (sin tocar BD)
node scripts/scraper-main.js --dry-run

# Scrapear 10 páginas
MAX_PAGES=10 node scripts/scraper-main.js

# Ver el navegador (modo debug)
HEADLESS=false node scripts/scraper-main.js
```

## ⚙️ Configuración

Edita `scripts/config/scraper.config.js`:

```javascript
// Control de tráfico
rateLimit: {
  requestDelay: 2000,    // 2seg entre productos
  pageDelay: 5000,       // 5seg entre páginas
  maxRetries: 3,         // Reintentos
}

// Imágenes
images: {
  minWidth: 400,         // Resolución mínima
  downloadEnabled: true, // Descargar localmente
  downloadPath: './public/products'
}

// Base de datos
database: {
  syncEnabled: true,     // Auto-sincronizar
  updateExisting: true   // Actualizar existentes
}
```

## 🔐 Variables de entorno

Crea un archivo `.env`:

```env
DROPPERS_EMAIL=tu-email@gmail.com
DROPPERS_PASSWORD=tu-password
MAX_PAGES=5
HEADLESS=true
```

## 🎯 Características

- ✅ Rate limiting automático (evita bloqueos)
- ✅ Reintentos con backoff exponencial
- ✅ Validación de resolución de imágenes
- ✅ Descarga local de imágenes
- ✅ Sincronización inteligente (crea/actualiza)
- ✅ Logs detallados
- ✅ Manejo robusto de errores
- ✅ Procesamiento por lotes

## 📊 Logs

Los logs se guardan en:
- `scripts/logs/scraper.log` - Log general
- `scripts/logs/errors.log` - Solo errores
- `scripts/data/productos-sync.json` - Datos scrapeados

## 🔧 Troubleshooting

**Error de login:**
```bash
# Verifica credenciales en config/scraper.config.js
```

**Bloqueo por rate limiting:**
```bash
# Aumenta los delays en la configuración
requestDelay: 3000  # 3 segundos
pageDelay: 10000    # 10 segundos
```

**Imágenes no se descargan:**
```bash
# Verifica permisos en la carpeta public/products
mkdir -p public/products
```

## 📝 Notas

- El scraper respeta el tráfico del sitio con delays inteligentes
- Las imágenes se filtran automáticamente (min 400x400px)
- Los productos se identifican por SKU para evitar duplicados
- Modo dry-run para probar sin afectar la BD
