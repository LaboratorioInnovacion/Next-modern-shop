# Guía de Uso del Scraper en Docker

## ✅ **Configuración Completa**

El scraper ya está configurado para funcionar con tu despliegue Docker. Los cambios incluyen:

1. ✅ Chromium instalado en el Dockerfile
2. ✅ Variables de entorno en docker-compose.yml
3. ✅ Volúmenes para persistir imágenes y logs
4. ✅ Scripts npm agregados

---

## 🚀 **Cómo Usar**

### **1. Reconstruir el contenedor** (solo la primera vez)
```powershell
cd modern-shopp
docker-compose down
docker-compose build
docker-compose up -d
```

### **2. Ejecutar el scraper**

#### **Opción A: Desde PowerShell (recomendado)**
```powershell
# Scraper completo (scrapea + sincroniza BD)
.\scripts\run-scraper.ps1

# Solo scraping (guarda JSON, no toca BD)
.\scripts\run-scraper.ps1 --dry-run

# Cambiar número de páginas
docker exec -e MAX_PAGES=10 -it ecommerce_app node scripts/scraper-main.js
```

#### **Opción B: Comandos directos**
```powershell
# Scraper completo
docker exec -it ecommerce_app npm run scrape

# Modo dry-run
docker exec -it ecommerce_app npm run scrape:dry

# Con más páginas
docker exec -e MAX_PAGES=20 -it ecommerce_app npm run scrape
```

#### **Opción C: Entrar al contenedor**
```powershell
docker exec -it ecommerce_app sh
node scripts/scraper-main.js
```

---

## 📁 **Archivos Generados**

Los archivos se guardan en tu máquina local (gracias a los volúmenes):

- **Imágenes**: `./public/products/` (accesibles desde tu app)
- **Logs**: `./scripts/logs/scraper.log`
- **Errores**: `./scripts/logs/errors.log`
- **JSON**: `./scripts/data/productos-sync.json`

---

## 🔧 **Configuración**

Edita las variables en `docker-compose.yml`:

```yaml
environment:
  - DROPPERS_EMAIL=tu-email@gmail.com
  - DROPPERS_PASSWORD=tu-password
  - MAX_PAGES=5                    # Páginas a scrapear
  - HEADLESS=true                  # false para ver navegador
```

---

## 📊 **Verificar Logs en Tiempo Real**

```powershell
# Ver logs del scraper
docker exec -it ecommerce_app tail -f scripts/logs/scraper.log

# Ver errores
docker exec -it ecommerce_app tail -f scripts/logs/errors.log

# Ver logs del contenedor
docker logs -f ecommerce_app
```

---

## 🎯 **Ejemplo Completo**

```powershell
# 1. Levantar contenedores
docker-compose up -d

# 2. Verificar que estén corriendo
docker ps

# 3. Ejecutar scraper (5 páginas)
.\scripts\run-scraper.ps1

# 4. Ver productos en BD
docker exec -it ecommerce_db psql -U postgres -d ecommerce -c "SELECT COUNT(*) FROM \"Product\";"

# 5. Ver logs
docker exec -it ecommerce_app cat scripts/logs/scraper.log
```

---

## ⚠️ **Troubleshooting**

### **Error: Chromium not found**
```powershell
# Reconstruir imagen
docker-compose build --no-cache
docker-compose up -d
```

### **Error: Permission denied en carpetas**
```powershell
# Crear carpetas si no existen
mkdir -p public/products
mkdir -p scripts/logs
mkdir -p scripts/data
```

### **Error: Cannot connect to database**
```powershell
# Verificar que postgres esté corriendo
docker-compose ps
docker exec -it ecommerce_db pg_isready -U postgres
```

### **El scraper es muy lento**
Edita `scripts/config/scraper.config.js`:
```javascript
rateLimit: {
  requestDelay: 1000,  // 1 segundo (reducido)
  pageDelay: 3000,     // 3 segundos (reducido)
}
```

---

## 🔄 **Automatización (Opcional)**

Para ejecutar el scraper automáticamente cada día:

### **Windows Task Scheduler**
1. Abrir "Programador de tareas"
2. Crear tarea básica
3. Acción: `powershell.exe`
4. Argumentos: `-File "E:\ecomercemil\v2\Next-modern-shop\modern-shopp\scripts\run-scraper.ps1"`

### **Cron (Linux/Mac)**
```bash
# Ejecutar todos los días a las 3 AM
0 3 * * * cd /path/to/modern-shopp && ./scripts/run-scraper.sh
```

---

## 📝 **Notas Importantes**

- ✅ El scraper respeta rate limits (2seg entre productos, 5seg entre páginas)
- ✅ Las imágenes se descargan localmente en `public/products/`
- ✅ Los productos duplicados se actualizan automáticamente (por SKU)
- ✅ El navegador corre en modo headless dentro del contenedor
- ✅ Todos los logs se guardan para auditoría

---

¿Todo listo? Ejecuta:
```powershell
docker-compose up -d
.\scripts\run-scraper.ps1
```
