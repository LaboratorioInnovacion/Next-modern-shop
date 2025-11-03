#!/bin/bash

# Deploy directo sin GitHub Actions
# Para usar cuando GitHub Actions tiene problemas de conectividad

echo "🚀 Deploy Directo - $(date)"

# Ir al directorio del proyecto
cd /home/psiconervio/ecomerce/Next-modern-shop/modern-shopp

# Actualizar código
echo "📥 Actualizando código..."
git pull origin main

# Crear .env si no existe  
if [ ! -f ".env" ]; then
  echo "📝 Creando .env..."
  cat > .env << 'EOF'
NODE_ENV=production
DATABASE_URL=postgresql://postgres:postgres_secure_2024@postgres:5432/ecommerce
NEXTAUTH_URL=https://tu-dominio-cloudflare.com
NEXTAUTH_SECRET=mi_secreto_super_seguro_2024
SECRET=mi_secreto_super_seguro_2024
MERCADOPAGO_ACCESS_TOKEN=APP_USR-3904014073520705-081821-ac9642583a0c52da7c3d6aae0fa8eafe-2631277847
NEXT_PUBLIC_URL=https://tu-dominio-cloudflare.com
POSTGRES_PASSWORD=postgres_secure_2024
EOF
fi

# Parar contenedores existentes
echo "⏹️ Parando contenedores..."
docker-compose -f docker-compose.prod.yml down 2>/dev/null || docker-compose down 2>/dev/null || true

# Limpiar Docker
echo "🧹 Limpiando Docker..."
docker system prune -f

# Construir y levantar
echo "🏗️ Construyendo aplicación..."
if [ -f "docker-compose.prod.yml" ]; then
  docker-compose -f docker-compose.prod.yml up -d --build
else
  docker-compose up -d --build
fi

# Verificar estado
echo "📊 Verificando despliegue..."
sleep 10
docker-compose ps

# Verificar que la app responde
echo "🔍 Probando aplicación..."
if curl -f http://localhost:3000 >/dev/null 2>&1; then
  echo "✅ Aplicación funcionando en http://localhost:3000"
else
  echo "⚠️ La aplicación puede estar iniciándose..."
fi

echo "🎉 Deploy completado!"
echo "📱 Accede vía Cloudflare Tunnel: https://tu-dominio-cloudflare.com"
echo "📊 Ver logs: docker-compose logs -f"