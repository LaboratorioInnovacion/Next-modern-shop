#!/bin/bash

# ==========================================
# SCRIPT AUTOMATIZADO CLOUDFLARE TUNNEL
# Crea un nuevo túnel para Next-modern-shop
# ==========================================

set -e  # Salir en caso de error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
TUNNEL_NAME="next-modern-shop-tunnel"
DOMAIN="ecomerce.noaservice.org"
CONFIG_DIR="$HOME/.cloudflared"
CONFIG_FILE="$CONFIG_DIR/config.yml"

# Función para logging
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo "🚀 Configurando Cloudflare Tunnel para Next-modern-shop"
echo "=================================================="

# 1. Verificar que cloudflared está instalado
if ! command -v cloudflared &> /dev/null; then
    log_error "cloudflared no está instalado. Instalando..."
    wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
    sudo dpkg -i cloudflared-linux-amd64.deb
    rm cloudflared-linux-amd64.deb
    log_success "cloudflared instalado"
fi

# 2. Crear directorio de configuración
mkdir -p "$CONFIG_DIR"
chmod 700 "$CONFIG_DIR"

# 3. Login a Cloudflare (si no está autenticado)
log_info "Verificando autenticación con Cloudflare..."
if [ ! -f "$CONFIG_DIR/cert.pem" ]; then
    log_info "Realizando login a Cloudflare..."
    log_warning "Se abrirá el navegador. Autoriza la conexión y vuelve aquí."
    cloudflared tunnel login
    log_success "Login completado"
else
    log_success "Ya estás autenticado con Cloudflare"
fi

# 4. Parar y eliminar contenedor actual si existe
log_info "Deteniendo contenedores cloudflared existentes..."
docker stop cloudflared-nextdb 2>/dev/null || true
docker rm cloudflared-nextdb 2>/dev/null || true

# 5. Eliminar túnel anterior si existe
log_info "Limpiando túneles anteriores..."
cloudflared tunnel delete "$TUNNEL_NAME" 2>/dev/null || true
cloudflared tunnel delete ecommerce-tunnel 2>/dev/null || true

# 6. Crear nuevo túnel
log_info "Creando nuevo túnel: $TUNNEL_NAME"
cloudflared tunnel create "$TUNNEL_NAME"

# 7. Obtener tunnel ID
TUNNEL_ID=$(cloudflared tunnel list | grep "$TUNNEL_NAME" | awk '{print $1}')
if [ -z "$TUNNEL_ID" ]; then
    log_error "No se pudo obtener el ID del túnel"
    exit 1
fi
log_success "Túnel creado con ID: $TUNNEL_ID"

# 8. Configurar DNS
log_info "Configurando DNS para $DOMAIN..."
cloudflared tunnel route dns "$TUNNEL_NAME" "$DOMAIN"
log_success "DNS configurado para $DOMAIN"

# 9. Crear archivo de configuración
log_info "Creando archivo de configuración..."
cat > "$CONFIG_FILE" << EOF
tunnel: $TUNNEL_ID
credentials-file: /etc/cloudflared/$TUNNEL_ID.json

# Configuración de logs
loglevel: info

# Configuración de conexiones
no-autoupdate: true
retries: 3

ingress:
  # E-commerce Next.js - Aplicación principal
  - hostname: $DOMAIN
    service: http://172.18.0.4:8080
    originRequest:
      httpHostHeader: $DOMAIN
      connectTimeout: 30s
      tlsTimeout: 10s
      keepAliveTimeout: 90s
      keepAliveConnections: 100
  
  # Evolution API
  - hostname: api.noaservice.org
    service: http://evo-api:8080

  - hostname: alltube.noaservice.org
    service: http://traefik:80

  # N8N
  - hostname: n8n.noaservice.org
    service: http://evo-n8n:5678

  # N8N del dokploy
  - hostname: n8ndokploy.noaservice.org
    service: http://dokploy-n8n:5678

  # PostgreSQL (TCP)
  - hostname: db.noaservice.org
    service: tcp://evo-postgres:5432

  # Dokploy panel principal
  - hostname: dokploy.noaservice.org
    service: http://traefik:80

  # Wildcard para apps desplegadas por Dokploy
  - hostname: '*.dokploy.noaservice.org'
    service: http://dokploy:3000

  - hostname: db2.noaservice.org
    service: tcp://postgres-next:5432

  # Default fallback
  - service: http_status:404
EOF

chmod 600 "$CONFIG_FILE"
log_success "Configuración creada en $CONFIG_FILE"

# 10. Crear y ejecutar contenedor cloudflared
log_info "Iniciando contenedor cloudflared..."
docker run -d \
  --name cloudflared-nextdb \
  --restart=always \
  --network evo-net \
  -v "$CONFIG_DIR:/etc/cloudflared:ro" \
  cloudflare/cloudflared:latest \
  tunnel --config /etc/cloudflared/config.yml run "$TUNNEL_NAME"

# 11. Esperar y verificar
log_info "Esperando a que el túnel se conecte..."
sleep 15

# 12. Verificar estado
if docker ps | grep -q cloudflared-nextdb; then
    log_success "✅ Contenedor cloudflared ejecutándose"
else
    log_error "❌ Error al iniciar contenedor cloudflared"
    docker logs cloudflared-nextdb
    exit 1
fi

# 13. Mostrar logs para verificar conexión
log_info "Logs del túnel (últimas 10 líneas):"
docker logs cloudflared-nextdb --tail 10

# 14. Probar conectividad
log_info "Probando conectividad..."
sleep 10

echo ""
log_success "🎉 Configuración completada!"
echo ""
echo "📋 Información del túnel:"
echo "  🌐 Dominio: https://$DOMAIN"
echo "  🆔 Tunnel ID: $TUNNEL_ID"
echo "  📁 Config: $CONFIG_FILE"
echo ""
echo "🔧 Comandos útiles:"
echo "  Ver logs: docker logs -f cloudflared-nextdb"
echo "  Reiniciar: docker restart cloudflared-nextdb"
echo "  Detener: docker stop cloudflared-nextdb"
echo "  Estado: docker ps | grep cloudflared"
echo ""
echo "🌍 Tu aplicación debería estar disponible en:"
echo "  https://$DOMAIN"
echo ""

# 15. Probar acceso final
log_info "Probando acceso a la aplicación..."
if curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN" | grep -q "200"; then
    log_success "✅ La aplicación responde correctamente"
else
    log_warning "⚠️ La aplicación aún no responde. Puede tardar unos minutos en propagarse."
fi

echo ""
log_info "🚀 Configuración completada. ¡Tu túnel está listo!"