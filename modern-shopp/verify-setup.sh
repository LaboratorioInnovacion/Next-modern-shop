#!/bin/bash

# Script para verificar que GitHub Actions funciona correctamente
echo "🔍 Verificando configuración de GitHub Actions..."

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

echo "Verificando requisitos..."

# Verificar Docker
if command -v docker &> /dev/null; then
    success "Docker está instalado"
else
    error "Docker no está instalado"
    exit 1
fi

# Verificar Docker Compose
if command -v docker-compose &> /dev/null; then
    success "Docker Compose está instalado"
else
    error "Docker Compose no está instalado"
    exit 1
fi

# Verificar que estamos en el directorio correcto
if [ -f "package.json" ] && [ -f "docker-compose.prod.yml" ]; then
    success "Estás en el directorio correcto del proyecto"
else
    error "Ejecuta este script desde el directorio del proyecto (donde está package.json)"
    exit 1
fi

# Verificar claves SSH
if [ -f ~/.ssh/github_actions_key ]; then
    success "Clave SSH para GitHub Actions existe"
else
    warning "Clave SSH no encontrada, ejecuta: ./setup-ssh.sh"
fi

# Verificar permisos
if [ -w . ]; then
    success "Tienes permisos de escritura en el directorio"
else
    error "No tienes permisos de escritura en el directorio"
fi

# Verificar Git
if git status &> /dev/null; then
    success "Repositorio Git válido"
    echo "📍 Rama actual: $(git branch --show-current)"
    echo "📝 Último commit: $(git log -1 --oneline)"
else
    error "No es un repositorio Git válido"
fi

# Test de conexión a GitHub
if curl -s https://api.github.com > /dev/null; then
    success "Conexión a GitHub funciona"
else
    warning "No se puede conectar a GitHub"
fi

echo ""
echo "🎯 Pasos siguientes:"
echo "1. Si no lo has hecho, ejecuta: ./setup-ssh.sh"
echo "2. Copia los secrets a GitHub (HOST, USERNAME, SSH_KEY, PORT, PROJECT_PATH)"
echo "3. Haz push a main para probar el deploy automático"
echo ""
echo "📊 Para monitorear: https://github.com/LaboratorioInnovacion/Next-modern-shop/actions"