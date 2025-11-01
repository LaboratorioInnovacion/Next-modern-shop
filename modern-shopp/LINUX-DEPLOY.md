# 🐧 Guía de Despliegue en Servidor Linux

## Requisitos del Servidor

### 1. Instalar Docker y Docker Compose
```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Agregar usuario al grupo docker
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Reiniciar sesión para aplicar cambios
newgrp docker
```

### 2. Verificar instalación
```bash
docker --version
docker-compose --version
```

## Proceso de Despliegue

### Opción A: Despliegue Automático (Recomendado)
```bash
# 1. Clonar repositorio
git clone https://github.com/LaboratorioInnovacion/Next-modern-shop.git
cd Next-modern-shop/modern-shopp

# 2. Dar permisos al script
chmod +x deploy.sh

# 3. Ejecutar despliegue
./deploy.sh
```

### Opción B: Despliegue Manual
```bash
# 1. Clonar repositorio
git clone https://github.com/LaboratorioInnovacion/Next-modern-shop.git
cd Next-modern-shop/modern-shopp

# 2. Crear archivo .env
cp .env.production .env

# 3. Editar variables de entorno (IMPORTANTE)
nano .env
# Cambiar:
# - NEXTAUTH_URL por tu IP/dominio
# - NEXT_PUBLIC_URL por tu IP/dominio
# - Los secretos por valores seguros

# 4. Levantar servicios
docker-compose -f docker-compose.prod.yml up -d --build

# 5. Ver logs
docker-compose -f docker-compose.prod.yml logs -f
```

## Configuración de Firewall

### UFW (Ubuntu)
```bash
# Habilitar firewall
sudo ufw enable

# Permitir SSH
sudo ufw allow 22

# Permitir puerto de la aplicación
sudo ufw allow 3000

# Verificar estado
sudo ufw status
```

## Configuración con Nginx (Opcional pero Recomendado)

### 1. Instalar Nginx
```bash
sudo apt install nginx -y
```

### 2. Configurar proxy reverso
```bash
# Crear configuración del sitio
sudo nano /etc/nginx/sites-available/ecommerce

# Contenido del archivo:
server {
    listen 80;
    server_name tu-dominio.com;  # Cambiar por tu dominio o IP

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Habilitar sitio
sudo ln -s /etc/nginx/sites-available/ecommerce /etc/nginx/sites-enabled/

# Probar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx

# Permitir HTTP en firewall
sudo ufw allow 80
sudo ufw allow 443  # Para HTTPS futuro
```

## SSL con Let's Encrypt (Recomendado para producción)

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtener certificado SSL
sudo certbot --nginx -d tu-dominio.com

# El certificado se renovará automáticamente
```

## Monitoreo y Mantenimiento

### Comandos útiles
```bash
# Ver estado de contenedores
docker-compose -f docker-compose.prod.yml ps

# Ver logs en tiempo real
docker-compose -f docker-compose.prod.yml logs -f

# Ver logs específicos
docker-compose -f docker-compose.prod.yml logs nextjs
docker-compose -f docker-compose.prod.yml logs postgres

# Reiniciar servicios
docker-compose -f docker-compose.prod.yml restart

# Actualizar aplicación
git pull
docker-compose -f docker-compose.prod.yml up -d --build

# Backup de base de datos
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U postgres ecommerce > backup_$(date +%Y%m%d).sql

# Restaurar backup
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U postgres ecommerce < backup_20241101.sql
```

### Automatizar backups
```bash
# Crear script de backup
nano backup.sh

#!/bin/bash
BACKUP_DIR="/home/usuario/backups"
mkdir -p $BACKUP_DIR
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U postgres ecommerce > $BACKUP_DIR/ecommerce_backup_$(date +%Y%m%d_%H%M%S).sql

# Eliminar backups antiguos (más de 7 días)
find $BACKUP_DIR -name "ecommerce_backup_*.sql" -mtime +7 -delete

# Hacer ejecutable
chmod +x backup.sh

# Programar en crontab (backup diario a las 2 AM)
crontab -e
# Agregar: 0 2 * * * /ruta/al/backup.sh
```

## Solución de Problemas

### Contenedor no inicia
```bash
# Ver logs detallados
docker-compose -f docker-compose.prod.yml logs nextjs

# Verificar configuración
docker-compose -f docker-compose.prod.yml config
```

### Error de base de datos
```bash
# Reiniciar PostgreSQL
docker-compose -f docker-compose.prod.yml restart postgres

# Acceder a PostgreSQL directamente
docker-compose -f docker-compose.prod.yml exec postgres psql -U postgres -d ecommerce
```

### Problemas de red
```bash
# Verificar puertos en uso
sudo netstat -tlnp | grep :3000

# Verificar conectividad
curl http://localhost:3000
```

## Variables de Entorno Importantes

Asegúrate de configurar correctamente en `.env`:

```env
# URLs - Cambiar localhost por tu IP/dominio
NEXTAUTH_URL=http://TU_IP_O_DOMINIO:3000
NEXT_PUBLIC_URL=http://TU_IP_O_DOMINIO:3000

# Secretos - Generar valores únicos y seguros
NEXTAUTH_SECRET=secreto_muy_seguro_y_largo
SECRET=otro_secreto_muy_seguro

# Base de datos - Cambiar contraseña por una segura
POSTGRES_PASSWORD=password_super_seguro_2024
```

## Resumen de URLs de Acceso

- **Aplicación**: http://TU_IP:3000
- **Con Nginx**: http://TU_DOMINIO (puerto 80)
- **Con SSL**: https://TU_DOMINIO (puerto 443)