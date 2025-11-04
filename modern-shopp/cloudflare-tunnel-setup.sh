#!/bin/bash

# Script de configuración de Cloudflare Tunnel para ecomerce.noaservice.org
# Ejecuta este script en tu servidor Linux

echo "=== Configuración de Cloudflare Tunnel ==="
echo ""

# 1. Verificar si cloudflared está instalado
if ! command -v cloudflared &> /dev/null; then
    echo "❌ cloudflared no está instalado"
    echo "Instalando cloudflared..."
    
    # Instalar cloudflared
    curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
    sudo dpkg -i cloudflared.deb
    rm cloudflared.deb
    
    echo "✅ cloudflared instalado"
else
    echo "✅ cloudflared ya está instalado"
fi

echo ""
echo "=== Pasos a seguir manualmente ==="
echo ""

echo "1. Autenticar con Cloudflare:"
echo "   cloudflared tunnel login"
echo ""

echo "2. Crear el tunnel (solo una vez):"
echo "   cloudflared tunnel create ecommerce-tunnel"
echo "   (Guarda el TUNNEL_ID que te muestre)"
echo ""

echo "3. Crear el archivo de configuración:"
echo "   Copia el siguiente contenido en ~/.cloudflared/config.yml"
echo ""
echo "---"
cat << 'EOF'
tunnel: <TU_TUNNEL_ID>
credentials-file: /root/.cloudflared/<TU_TUNNEL_ID>.json

ingress:
  - hostname: ecomerce.noaservice.org
    service: http://localhost:8080
  - service: http_status:404
EOF
echo "---"
echo ""

echo "4. Configurar el DNS en Cloudflare:"
echo "   cloudflared tunnel route dns ecommerce-tunnel ecomerce.noaservice.org"
echo ""

echo "5. Ejecutar el tunnel como servicio:"
echo "   sudo cloudflared service install"
echo "   sudo systemctl start cloudflared"
echo "   sudo systemctl enable cloudflared"
echo ""

echo "6. Verificar que el tunnel está corriendo:"
echo "   sudo systemctl status cloudflared"
echo "   cloudflared tunnel info ecommerce-tunnel"
echo ""

echo "=== Configuración completa ==="
echo "Tu aplicación estará disponible en: https://ecomerce.noaservice.org"
