#!/bin/bash

# Script de despliegue para servidor Linux
# Uso: ./deploy.sh

echo "🚀 Iniciando despliegue del eCommerce..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para mostrar errores
error_exit() {
    echo -e "${RED}❌ Error: $1${NC}" >&2
    exit 1
}

# Función para mostrar éxito
success_msg() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Función para mostrar advertencias
warning_msg() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Verificar que Docker esté instalado
if ! command -v docker &> /dev/null; then
    error_exit "Docker no está instalado. Por favor instala Docker primero."
fi

if ! command -v docker-compose &> /dev/null; then
    error_exit "Docker Compose no está instalado. Por favor instala Docker Compose primero."
fi

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ] || [ ! -f "docker-compose.yml" ]; then
    error_exit "Este script debe ejecutarse desde el directorio raíz del proyecto (donde está package.json)"
fi

# Obtener IP del servidor
SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')
echo "📡 IP del servidor detectada: $SERVER_IP"

# Crear archivo .env si no existe
if [ ! -f ".env" ]; then
    warning_msg "Creando archivo .env con configuración por defecto..."
    cat > .env << EOF
NODE_ENV=production
DATABASE_URL=postgresql://postgres:postgres_secure_password_2024@postgres:5432/ecommerce
NEXTAUTH_URL=http://${SERVER_IP}:3000
NEXTAUTH_SECRET=$(openssl rand -base64 32)
SECRET=$(openssl rand -base64 32)
MERCADOPAGO_ACCESS_TOKEN=APP_USR-3904014073520705-081821-ac9642583a0c52da7c3d6aae0fa8eafe-2631277847
NEXT_PUBLIC_URL=http://${SERVER_IP}:3000
POSTGRES_PASSWORD=postgres_secure_password_2024
EOF
    success_msg "Archivo .env creado. ¡Revisa y modifica las variables según sea necesario!"
fi

# Parar contenedores existentes si existen
echo "🛑 Deteniendo contenedores existentes..."
docker-compose -f docker-compose.prod.yml down 2>/dev/null || true

# Limpiar imágenes antigas (opcional)
read -p "¿Quieres limpiar imágenes Docker antiguas? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🧹 Limpiando imágenes antiguas..."
    docker system prune -f
fi

# Construir y levantar contenedores
echo "🏗️  Construyendo y levantando contenedores..."
if docker-compose -f docker-compose.prod.yml up -d --build; then
    success_msg "Contenedores levantados exitosamente!"
else
    error_exit "Falló al levantar los contenedores"
fi

# Esperar a que los servicios estén listos
echo "⏳ Esperando a que los servicios estén listos..."
sleep 10

# Verificar que los contenedores estén corriendo
if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    success_msg "Los contenedores están corriendo!"
    
    echo ""
    echo "🎉 ¡Despliegue completado!"
    echo ""
    echo "📱 Accede a tu aplicación en:"
    echo "   🌐 http://${SERVER_IP}:3000"
    echo ""
    echo "📊 Comandos útiles:"
    echo "   Ver logs:           docker-compose -f docker-compose.prod.yml logs -f"
    echo "   Parar servicios:    docker-compose -f docker-compose.prod.yml down"
    echo "   Reiniciar:          docker-compose -f docker-compose.prod.yml restart"
    echo "   Estado:             docker-compose -f docker-compose.prod.yml ps"
    echo ""
    echo "🔧 Para acceder al contenedor de la app:"
    echo "   docker-compose -f docker-compose.prod.yml exec nextjs sh"
    echo ""
else
    error_exit "Algunos contenedores no están corriendo correctamente"
fi