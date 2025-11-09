#!/bin/bash

# Script para verificar y reparar Cloudflare Tunnel

echo "🔍 Verificando estado de Cloudflare Tunnel..."

# Verificar si cloudflared está ejecutándose
if sudo systemctl is-active --quiet cloudflared; then
    echo "✅ Cloudflared está ejecutándose"
else
    echo "❌ Cloudflared no está ejecutándose"
    echo "🔄 Intentando reiniciar..."
    sudo systemctl restart cloudflared
    sleep 5
    
    if sudo systemctl is-active --quiet cloudflared; then
        echo "✅ Cloudflared reiniciado exitosamente"
    else
        echo "❌ Error al reiniciar cloudflared"
        sudo systemctl status cloudflared
        exit 1
    fi
fi

# Verificar logs recientes
echo "📋 Logs recientes de Cloudflare Tunnel:"
sudo journalctl -u cloudflared --since "5 minutes ago" --no-pager | tail -10

# Verificar configuración
echo "🔧 Verificando configuración..."
if [ -f ~/.cloudflared/config.yml ]; then
    echo "✅ Archivo de configuración encontrado"
    cat ~/.cloudflared/config.yml | grep -E "(service|hostname)"
else
    echo "❌ Archivo de configuración no encontrado"
    echo "📝 Debes configurar el túnel manualmente"
fi

# Verificar conectividad local
echo "🌐 Verificando conectividad local..."
if curl -s http://localhost:8081/health > /dev/null; then
    echo "✅ Aplicación local responde correctamente"
else
    echo "❌ Aplicación local no responde"
    echo "🔍 Verificando contenedores Docker..."
    docker ps | grep ecommerce
fi

echo "✅ Verificación completada"