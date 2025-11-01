# 🔄 Guía de Auto-Deploy y Actualizaciones

## Opciones de Actualización Automática

### 🎯 **Opción 1: Manual (Recomendado para empezar)**

Cuando hagas cambios en GitHub:
```bash
# Conectar por SSH a tu servidor
ssh usuario@tu-servidor

# Ir al proyecto y actualizar
cd Next-modern-shop/modern-shopp
./update.sh
```

**Pros:** Simple, control total  
**Contras:** Requiere conexión manual

---

### 🚀 **Opción 2: GitHub Actions (Recomendado)**

#### Configurar Secrets en GitHub:
1. Ve a tu repositorio en GitHub
2. Settings > Secrets and variables > Actions
3. Agrega estos secrets:

```
HOST: tu-servidor-ip
USERNAME: tu-usuario-ssh  
SSH_KEY: tu-clave-ssh-privada
PORT: 22
PROJECT_PATH: /home/tu-usuario
```

#### Generar clave SSH (en tu servidor):
```bash
# Generar par de claves
ssh-keygen -t rsa -b 4096 -C "deploy-key"

# Agregar clave pública a authorized_keys
cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys

# Mostrar clave privada (copia esto al secret SSH_KEY)
cat ~/.ssh/id_rsa
```

**Pros:** Automático al hacer push, logs en GitHub  
**Contras:** Requiere configuración inicial

---

### 🔗 **Opción 3: Webhook (Más Avanzado)**

#### En tu servidor Linux:
```bash
# 1. Ejecutar script de configuración
chmod +x setup-webhook.sh
sudo ./setup-webhook.sh

# 2. Abrir puerto en firewall
sudo ufw allow 9000
```

#### En GitHub:
1. Ve a Settings > Webhooks
2. Add webhook:
   - URL: `http://TU_IP:9000/hooks/deploy-ecommerce`
   - Content type: `application/json`
   - Secret: `tu_secreto_webhook_aqui`
   - Events: `Just the push event`

**Pros:** Instantáneo, no requiere GitHub Actions  
**Contras:** Más complejo de configurar

---

### ⏰ **Opción 4: Verificación Automática (Cron)**

```bash
# 1. Hacer ejecutable el script
chmod +x auto-update.sh

# 2. Programar en crontab (cada 5 minutos)
crontab -e

# Agregar esta línea:
*/5 * * * * /home/tu-usuario/Next-modern-shop/modern-shopp/auto-update.sh

# Ver logs de actualizaciones
tail -f /var/log/auto-update.log
```

**Pros:** Funciona sin configuración externa  
**Contras:** Puede haber delay de hasta 5 minutos

---

## 🔧 Comandos Útiles

### Verificar estado del deployment:
```bash
# Ver contenedores corriendo
docker-compose -f docker-compose.prod.yml ps

# Ver logs en tiempo real  
docker-compose -f docker-compose.prod.yml logs -f

# Reiniciar si hay problemas
docker-compose -f docker-compose.prod.yml restart
```

### Verificar logs de auto-update:
```bash
# Ver últimas actualizaciones
tail -20 /var/log/auto-update.log

# Monitorear en tiempo real
tail -f /var/log/auto-update.log
```

### Verificar webhook:
```bash
# Estado del servicio
sudo systemctl status webhook-deploy

# Logs del webhook
sudo journalctl -u webhook-deploy -f
```

---

## 🚨 Solución de Problemas

### Error de permisos:
```bash
# Dar permisos a todos los scripts
chmod +x *.sh
sudo chown -R $USER:$USER /home/$USER/Next-modern-shop/
```

### Error de Git:
```bash
# Resetear cambios locales si hay conflictos
cd Next-modern-shop/modern-shopp
git reset --hard HEAD
git clean -fd
git pull origin main
```

### Error de Docker:
```bash
# Limpiar y reconstruir todo
docker-compose -f docker-compose.prod.yml down -v
docker system prune -f
docker-compose -f docker-compose.prod.yml up -d --build
```

---

## 📊 Flujo Recomendado

1. **Desarrollo local:** Haz cambios en tu código
2. **Commit y push:** `git add . && git commit -m "descripción" && git push`
3. **Auto-deploy:** Se ejecuta automáticamente según el método elegido
4. **Verificación:** Revisa que la app funcione en `http://TU_IP:3000`

---

## 🎯 Recomendación

**Para empezar:** Usa la **Opción 1 (Manual)** hasta que te familiarices  
**Para producción:** Implementa **Opción 2 (GitHub Actions)** por su simplicidad y logs  
**Para empresas:** Combina **Opción 2 + Opción 4** para máxima redundancia