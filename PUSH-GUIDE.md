# 🚀 Guía Rápida: Push y Deploy de Feature Scraper

## 📋 Estado Actual

✅ **Rama creada:** `feature/scraper`  
✅ **Commits realizados:** 2 commits con todo el código del scraper  
✅ **Workflow configurado:** `.github/workflows/deploy-scraper.yml`  
⏳ **Pendiente:** Push a GitHub y configurar secrets  

---

## 🎯 Paso 1: Configurar Secrets en GitHub

**ANTES de hacer push**, configura los secrets:

1. Ve a: https://github.com/LaboratorioInnovacion/Next-modern-shop/settings/secrets/actions

2. Agrega estos 2 nuevos secrets:

   **DROPPERS_EMAIL**
   ```
   augustodelcampo97@gmail.com
   ```

   **DROPPERS_PASSWORD**
   ```
   Eldragon97
   ```

3. Verifica que también existan (ya deberían estar):
   - POSTGRES_PASSWORD
   - NEXTAUTH_SECRET
   - SECRET
   - MERCADOPAGO_ACCESS_TOKEN

---

## 🚢 Paso 2: Push de la Rama

```powershell
# Desde: e:\ecomercemil\v2\Next-modern-shop

# Ver commits realizados
git log --oneline -n 3

# Push de la rama nueva
git push -u origin feature/scraper
```

**¿Qué pasará?**
- ✅ Se subirá la rama a GitHub
- ✅ Se ejecutará automáticamente el workflow `deploy-scraper.yml`
- ✅ GitHub Actions construirá la imagen con Chromium
- ✅ Desplegará en tu servidor self-hosted
- 🧪 Ejecutará test del scraper en modo dry-run

---

## 📊 Paso 3: Monitorear el Deploy

1. Ve a: https://github.com/LaboratorioInnovacion/Next-modern-shop/actions

2. Verás el workflow "Deploy Scraper Branch" ejecutándose

3. Click en el workflow para ver los logs en tiempo real

4. Espera ~10-15 minutos (incluye construcción de Docker)

---

## ✅ Paso 4: Verificar Despliegue

### **A) Ver logs del workflow**
En GitHub Actions verás cada paso:
- ✅ Checkout code
- ✅ Verificar Cloudflare
- ✅ Crear .env.production
- ✅ Construir con Chromium
- ✅ Levantar servicios
- ✅ Test scraper (dry-run)

### **B) Conectarse al servidor**
```powershell
# SSH a tu servidor (ajusta según tu configuración)
ssh usuario@tu-servidor

# Ver contenedores
docker ps

# Ver logs del scraper
docker logs ecommerce_app --tail 50

# Ver archivos generados
docker exec ecommerce_app ls -lh scripts/logs/
docker exec ecommerce_app ls -lh scripts/data/
```

---

## 🧪 Paso 5: Probar el Scraper

### **Opción A: Desde el servidor**
```bash
# Conectarse al contenedor
docker exec -it ecommerce_app sh

# Ejecutar scraper en modo prueba
node scripts/scraper-main.js --dry-run

# Ver logs
cat scripts/logs/scraper.log
```

### **Opción B: Ejecución remota**
```bash
# Desde SSH
docker exec ecommerce_app npm run scrape:dry

# Scraper completo (sincroniza BD)
docker exec ecommerce_app npm run scrape
```

---

## 🔄 Paso 6: Merge a Main (Opcional)

Una vez que todo funcione bien:

### **Opción A: Pull Request**
```powershell
# Ve a GitHub y crea un PR
# https://github.com/LaboratorioInnovacion/Next-modern-shop/compare/feature/scraper
```

### **Opción B: Merge directo**
```powershell
git checkout main
git merge feature/scraper
git push origin main
```

⚠️ **Al hacer merge a main:**
- Se ejecutará el workflow `deploy.yml` (el normal)
- NO se ejecutará el test del scraper automáticamente
- Tendrás que ejecutar el scraper manualmente

---

## 🎛️ Configuración Avanzada

### **Cambiar número de páginas a scrapear**

Edita `.github/workflows/deploy-scraper.yml`:
```yaml
MAX_PAGES=2  # Cambiar a 5, 10, etc.
```

### **Desactivar test automático del scraper**

Comenta la sección "Test scraper" en el workflow:
```yaml
# - name: Test scraper (dry-run)
#   continue-on-error: true
#   run: |
#     ...
```

### **Ejecutar scraper en cada deploy**

Cambia `--dry-run` por modo normal:
```yaml
docker-compose -f docker-compose.prod.yml exec -T nextjs node scripts/scraper-main.js
```

---

## ⚠️ Troubleshooting

### **Error: Secret not found**
→ Asegúrate de haber agregado DROPPERS_EMAIL y DROPPERS_PASSWORD en GitHub

### **Error: No self-hosted runner found**
→ Verifica que tu runner esté activo:
```bash
# En el servidor
systemctl status actions.runner.*
```

### **Build tarda mucho**
→ Normal, Chromium es pesado (~100MB). Primera vez puede tardar 15 min.

### **Test del scraper falla**
→ Revisa logs en GitHub Actions, puede ser problema de credenciales o red

---

## 📝 Resumen de Archivos Nuevos

```
.github/
  └── workflows/
      └── deploy-scraper.yml        # Workflow para feature/scraper
  └── GITHUB_SECRETS.md             # Documentación de secrets

modern-shopp/
  ├── Dockerfile                    # Modificado: +Chromium
  ├── docker-compose.yml            # Modificado: +volúmenes +env vars
  ├── package.json                  # Modificado: +scripts scrape
  ├── SCRAPER-DOCKER.md             # Guía de uso
  ├── .env.example                  # Template de variables
  └── scripts/
      ├── README.md                 # Doc del scraper
      ├── scraper-main.js           # Script principal
      ├── run-scraper.ps1           # Helper PowerShell
      ├── run-scraper.sh            # Helper Bash
      ├── config/
      │   └── scraper.config.js     # Configuración
      ├── scrapers/
      │   └── product-scraper.js    # Lógica de scraping
      ├── sync/
      │   └── database-sync.js      # Sync con BD
      └── utils/
          └── helpers.js            # Utilidades
```

---

## 🎯 Comando para Ejecutar Ahora

```powershell
# 1. Configurar secrets en GitHub (link arriba)

# 2. Push
cd e:\ecomercemil\v2\Next-modern-shop
git push -u origin feature/scraper

# 3. Monitorear en GitHub Actions
# https://github.com/LaboratorioInnovacion/Next-modern-shop/actions

# 4. Esperar ~15 minutos

# 5. ¡Listo! 🎉
```

---

¿Listo para hacer el push? 🚀
