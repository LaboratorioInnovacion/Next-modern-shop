#!/bin/bash

# Script para generar claves SSH para GitHub Actions
echo "🔑 Configurando SSH para GitHub Actions..."

# Generar par de claves SSH
echo "Generando claves SSH..."
ssh-keygen -t rsa -b 4096 -f ~/.ssh/github_actions_key -N ""

# Agregar clave pública a authorized_keys
cat ~/.ssh/github_actions_key.pub >> ~/.ssh/authorized_keys

# Establecer permisos correctos
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
chmod 600 ~/.ssh/github_actions_key
chmod 644 ~/.ssh/github_actions_key.pub

echo ""
echo "✅ Claves SSH generadas!"
echo ""
echo "📋 COPIA ESTA CLAVE PRIVADA para el secret SSH_KEY en GitHub:"
echo "================================================="
cat ~/.ssh/github_actions_key
echo "================================================="
echo ""
echo "📝 Información para los secrets de GitHub:"
echo "HOST: $(curl -s ifconfig.me)"
echo "USERNAME: $USER"
echo "PORT: 22"
echo "PROJECT_PATH: $(dirname $(pwd))"
echo ""
echo "🔧 Siguiente paso: Ir a GitHub > Settings > Secrets and variables > Actions"