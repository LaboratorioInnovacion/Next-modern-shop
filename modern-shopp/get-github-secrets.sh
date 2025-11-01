#!/bin/bash

# Script para obtener toda la información necesaria para GitHub Actions
echo "🔍 Recopilando información para GitHub Actions..."
echo ""
echo "================================================="
echo "📋 INFORMACIÓN PARA GITHUB SECRETS"
echo "================================================="
echo ""

# Obtener IP pública
echo "🌐 HOST (IP del servidor):"
PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null)
if [ -n "$PUBLIC_IP" ]; then
    echo "   $PUBLIC_IP"
else
    echo "   $(hostname -I | awk '{print $1}')"
fi
echo ""

# Usuario actual
echo "👤 USERNAME:"
echo "   $USER"
echo ""

# Puerto SSH (normalmente 22)
echo "🚪 PORT:"
SSH_PORT=$(ss -tlnp | grep :22 | wc -l)
if [ $SSH_PORT -gt 0 ]; then
    echo "   22"
else
    echo "   22 (verificar que SSH esté corriendo)"
fi
echo ""

# Project path
echo "📁 PROJECT_PATH:"
echo "   $(dirname $(pwd))"
echo ""

# Verificar/crear clave SSH
echo "🔑 SSH_KEY:"
SSH_KEY_FILE="$HOME/.ssh/github_actions_key"

if [ ! -f "$SSH_KEY_FILE" ]; then
    echo "   Generando nueva clave SSH..."
    ssh-keygen -t rsa -b 4096 -f "$SSH_KEY_FILE" -N "" -C "github-actions-$(date +%Y%m%d)"
    
    # Agregar a authorized_keys
    cat "${SSH_KEY_FILE}.pub" >> "$HOME/.ssh/authorized_keys"
    chmod 600 "$HOME/.ssh/authorized_keys"
    chmod 600 "$SSH_KEY_FILE"
    
    echo "   ✅ Clave SSH creada y configurada"
fi

echo "   Copia TODA esta clave privada (desde BEGIN hasta END):"
echo "   ================================================="
cat "$SSH_KEY_FILE"
echo "   ================================================="
echo ""

echo "🎯 RESUMEN PARA GITHUB:"
echo "================================"
echo "HOST:         $(curl -s ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')"
echo "USERNAME:     $USER"
echo "PORT:         22"
echo "PROJECT_PATH: $(dirname $(pwd))"
echo "SSH_KEY:      [La clave completa mostrada arriba]"
echo ""

echo "📝 PRÓXIMOS PASOS:"
echo "1. Ve a: https://github.com/LaboratorioInnovacion/Next-modern-shop/settings/secrets/actions"
echo "2. Haz clic en 'New repository secret' para cada uno"
echo "3. Copia exactamente los valores mostrados arriba"
echo "4. Haz un push para probar el deploy automático"
echo ""

# Test de conectividad SSH local
echo "🔧 VERIFICANDO CONFIGURACIÓN SSH..."
if ssh -o BatchMode=yes -o ConnectTimeout=5 -i "$SSH_KEY_FILE" "$USER@localhost" echo "SSH OK" 2>/dev/null; then
    echo "✅ SSH configurado correctamente"
else
    echo "⚠️  Configurando SSH..."
    # Asegurar permisos correctos
    chmod 700 ~/.ssh
    chmod 600 ~/.ssh/authorized_keys
    chmod 600 "$SSH_KEY_FILE"
    
    # Reiniciar SSH si es necesario
    sudo systemctl restart ssh 2>/dev/null || sudo systemctl restart sshd 2>/dev/null || true
fi

echo ""
echo "🚀 Todo listo para GitHub Actions!"