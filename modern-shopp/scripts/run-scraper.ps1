# Script PowerShell para ejecutar el scraper dentro del contenedor Docker

Write-Host "🚀 Ejecutando scraper en contenedor..." -ForegroundColor Green

docker exec -it ecommerce_app node scripts/scraper-main.js $args
