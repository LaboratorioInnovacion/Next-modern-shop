#!/bin/bash

# Script para actualizar la aplicación en producción
# Uso: ./update.sh

echo "🔄 Actualizando aplicación..."

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}1. Descargando últimos cambios...${NC}"
git pull origin main

echo -e "${YELLOW}2. Reconstruyendo contenedores...${NC}"
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build

echo -e "${GREEN}✅ Actualización completada!${NC}"
echo "📊 Ver logs: docker-compose -f docker-compose.prod.yml logs -f"