# Guía de implementación: Nginx + Cloudflare Tunnel

## Arquitectura
```
Internet → Cloudflare Tunnel → Nginx (puerto 8080) → Next.js App (puerto 3000) → PostgreSQL
```

## Prerequisitos
- Cuenta de Cloudflare con un dominio configurado
- Cloudflare Tunnel ya instalado en tu servidor Linux
- Docker y Docker Compose funcionando

---

## Paso 1: Configurar Cloudflare Tunnel

### 1.1. Crear el tunnel (si no lo tienes)
```bash
cloudflared tunnel login
cloudflared tunnel create ecommerce-tunnel
```

Esto creará:
- Un tunnel ID (guárdalo)
- Un archivo de credenciales en `~/.cloudflared/<TUNNEL_ID>.json`

### 1.2. Configurar DNS en Cloudflare
```bash
cloudflared tunnel route dns ecommerce-tunnel tudominio.com
```

Esto creará automáticamente un registro CNAME en Cloudflare que apunta a tu tunnel.

### 1.3. Crear archivo de configuración
Crea el archivo `~/.cloudflared/config.yml`:

```yaml
tunnel: <TU_TUNNEL_ID>
credentials-file: /root/.cloudflared/<TU_TUNNEL_ID>.json

ingress:
  - hostname: tudominio.com
    service: http://localhost:8080
  - service: http_status:404
```

---

## Paso 2: Configurar Nginx

El archivo `nginx.conf` ya está creado en tu proyecto y se montará automáticamente en el contenedor.

---

## Paso 3: Actualizar variables de entorno

Edita el archivo `.env` en `modern-shopp/`:

```env
NODE_ENV=production
DATABASE_URL=postgresql://postgres:postgres_secure_2024@postgres:5432/ecommerce
NEXTAUTH_URL=https://tudominio.com
NEXTAUTH_SECRET=tu_secreto_super_seguro_2024
SECRET=tu_secreto_super_seguro_2024
MERCADOPAGO_ACCESS_TOKEN=TU_TOKEN_MERCADOPAGO
NEXT_PUBLIC_URL=https://tudominio.com
POSTGRES_PASSWORD=postgres_secure_2024
```

**Importante:** Cambia `tudominio.com` por tu dominio real.

---

## Paso 4: Iniciar Cloudflare Tunnel

### Opción 1: Ejecutar como servicio (recomendado)
```bash
sudo cloudflared service install
sudo systemctl start cloudflared
sudo systemctl enable cloudflared
```

### Opción 2: Ejecutar manualmente (para pruebas)
```bash
cloudflared tunnel run ecommerce-tunnel
```

---

## Paso 5: Desplegar la aplicación

Los contenedores se levantarán automáticamente con GitHub Actions al hacer push.

O manualmente:
```bash
cd /ruta/a/modern-shopp
docker-compose -f docker-compose.prod.yml up -d
```

---

## Paso 6: Verificar

### 6.1. Verificar contenedores
```bash
docker-compose -f docker-compose.prod.yml ps
```

Deberías ver 3 contenedores corriendo:
- `ecommerce_db_prod` (PostgreSQL)
- `ecommerce_app_prod` (Next.js)
- `ecommerce_nginx` (Nginx)

### 6.2. Verificar Nginx
```bash
curl http://localhost:8080/health
```

Debería retornar: `healthy`

### 6.3. Verificar Cloudflare Tunnel
```bash
cloudflared tunnel info ecommerce-tunnel
```

### 6.4. Probar desde internet
Abre tu navegador y ve a: `https://tudominio.com`

---

## Logs y troubleshooting

### Ver logs de Nginx
```bash
docker logs ecommerce_nginx
```

### Ver logs de la app
```bash
docker logs ecommerce_app_prod
```

### Ver logs de Cloudflare Tunnel
```bash
sudo journalctl -u cloudflared -f
```

### Ver logs de PostgreSQL
```bash
docker logs ecommerce_db_prod
```

---

## Configuración de Cloudflare (Dashboard)

1. Ve a tu dominio en Cloudflare Dashboard
2. Asegúrate de que el registro CNAME esté creado (lo hace automáticamente el tunnel)
3. En **SSL/TLS**, selecciona **Full** o **Full (strict)**
4. En **Speed > Optimization**, habilita:
   - Auto Minify (JS, CSS, HTML)
   - Brotli
5. En **Caching**, configura reglas de cache para activos estáticos

---

## Múltiples aplicaciones (opcional)

Si tienes varias aplicaciones, actualiza `~/.cloudflared/config.yml`:

```yaml
tunnel: <TU_TUNNEL_ID>
credentials-file: /root/.cloudflared/<TU_TUNNEL_ID>.json

ingress:
  # Aplicación 1
  - hostname: app1.tudominio.com
    service: http://localhost:8080
  
  # Aplicación 2
  - hostname: app2.tudominio.com
    service: http://localhost:8081
  
  # Aplicación 3
  - hostname: app3.tudominio.com
    service: http://localhost:8082
  
  - service: http_status:404
```

Y configura un Nginx para cada aplicación en puertos diferentes.

---

## Seguridad adicional

### 1. Firewall (UFW)
```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP (para redireccionamientos)
sudo ufw allow 443/tcp   # HTTPS (para redireccionamientos)
sudo ufw enable
```

No necesitas abrir el puerto 8080 porque Cloudflare Tunnel se conecta desde dentro.

### 2. Limitar acceso a PostgreSQL
PostgreSQL solo debe ser accesible desde los contenedores de Docker, no desde internet.

### 3. Variables de entorno seguras
- Usa secretos de GitHub Actions para producción
- No comitees el archivo `.env` al repositorio

---

## Resumen

✅ Cloudflare Tunnel maneja SSL/TLS automáticamente  
✅ Nginx actúa como reverse proxy  
✅ No necesitas abrir puertos en tu router  
✅ Todo el tráfico pasa por Cloudflare (DDoS protection, CDN, etc.)  
✅ Deploy automático con GitHub Actions

---

## Comandos útiles

```bash
# Reiniciar Nginx
docker restart ecommerce_nginx

# Reiniciar la app
docker restart ecommerce_app_prod

# Reiniciar Cloudflare Tunnel
sudo systemctl restart cloudflared

# Ver todos los tunnels
cloudflared tunnel list

# Eliminar un tunnel
cloudflared tunnel delete <TUNNEL_NAME>
```
