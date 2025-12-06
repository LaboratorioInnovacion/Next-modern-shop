# Secrets Necesarios en GitHub

Para que el workflow `deploy-scraper.yml` funcione correctamente, necesitas configurar los siguientes secrets en GitHub:

## 📍 Cómo agregar secrets:
1. Ve a tu repositorio en GitHub
2. Click en **Settings** → **Secrets and variables** → **Actions**
3. Click en **New repository secret**
4. Agrega cada uno de los siguientes:

---

## 🔐 Secrets Existentes (Ya deberías tenerlos)

```
POSTGRES_PASSWORD
NEXTAUTH_SECRET
SECRET
MERCADOPAGO_ACCESS_TOKEN
```

---

## 🆕 Nuevos Secrets para el Scraper

### **DROPPERS_EMAIL**
```
augustodelcampo97@gmail.com
```

### **DROPPERS_PASSWORD**
```
Eldragon97
```

⚠️ **IMPORTANTE**: Estos son secretos sensibles. Nunca los compartas públicamente.

---

## 🎯 Verificar Secrets

Después de agregarlos, deberías ver en GitHub Actions > Secrets:

- ✅ POSTGRES_PASSWORD
- ✅ NEXTAUTH_SECRET
- ✅ SECRET
- ✅ MERCADOPAGO_ACCESS_TOKEN
- ✅ DROPPERS_EMAIL (nuevo)
- ✅ DROPPERS_PASSWORD (nuevo)

---

## 🚀 Cómo Funciona el Workflow

### **Trigger automático:**
```yaml
on:
  push:
    branches: [ feature/scraper ]  # Se ejecuta al pushear a esta rama
  pull_request:
    branches: [ main ]             # Se ejecuta al crear PR a main
  workflow_dispatch:               # Permite ejecutar manualmente
```

### **Pasos del workflow:**
1. ✅ Checkout del código
2. ✅ Verifica túnel Cloudflare
3. ✅ Crea .env.production con secrets
4. ✅ Para contenedores existentes
5. ✅ Crea directorios necesarios (public/products, scripts/logs)
6. ✅ Construye imagen Docker con Chromium
7. ✅ Levanta servicios
8. ✅ Ejecuta migraciones Prisma
9. ✅ Verifica salud de la app
10. 🧪 **Prueba scraper en modo dry-run (1 página)**

---

## 🧪 Test del Scraper

El workflow ejecuta automáticamente:
```bash
docker exec nextjs node scripts/scraper-main.js --dry-run
```

Esto:
- ✅ Prueba que Puppeteer funciona
- ✅ Verifica login en Droppers
- ✅ Scrapea 1 página de prueba
- ✅ NO toca la base de datos (dry-run)
- ✅ Genera logs en scripts/logs/

---

## 🔄 Ejecutar Manualmente

### **Desde GitHub:**
1. Ve a **Actions** → **Deploy Scraper Branch**
2. Click en **Run workflow**
3. Selecciona rama `feature/scraper`
4. Click **Run workflow**

### **Desde terminal (después del push):**
El workflow se ejecuta automáticamente.

---

## 📊 Monitorear Ejecución

Durante la ejecución puedes ver:
- Logs en tiempo real en GitHub Actions
- Estado de cada paso
- Logs del scraper (si llega al test)

---

## ⚠️ Troubleshooting

### **Error: Secret not found**
→ Verifica que agregaste DROPPERS_EMAIL y DROPPERS_PASSWORD en Settings > Secrets

### **Error: Chromium not found**
→ El Dockerfile ahora instala Chromium automáticamente

### **Error: Permission denied en carpetas**
→ El workflow crea las carpetas con `chmod 777`

### **Scraper falla en test**
→ Es normal en la primera ejecución, revisa los logs para diagnosticar

---

## 🎯 Siguiente Paso

Después de agregar los secrets:

```powershell
# Push de esta rama (trigger automático)
git push -u origin feature/scraper
```

El workflow se ejecutará automáticamente en GitHub Actions.
