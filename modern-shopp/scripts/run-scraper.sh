#!/bin/bash
# Script para ejecutar el scraper dentro del contenedor Docker

echo "🚀 Ejecutando scraper en contenedor..."

docker exec -it ecommerce_app node scripts/scraper-main.js "$@"
