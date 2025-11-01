#!/bin/bash

# Script completo para desplegar el proyecto en Linux
echo "🚀 Iniciando despliegue completo del proyecto..."

# Colores para mejor visualización
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

success() { echo -e "${GREEN}✅ $1${NC}"; }
info() { echo -e "${YELLOW}ℹ️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; }

# Verificar que estamos en el servidor correcto
info "Verificando servidor..."
echo "🖥️  Hostname: $(hostname)"
echo "🌐 IP: $(curl -s ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')"
echo "👤 Usuario: $(whoami)"
echo ""

# Ir al directorio del proyecto
PROJECT_DIR="/home/psiconervio/ecomerce/Next-modern-shop/modern-shopp"
info "Navegando al directorio del proyecto: $PROJECT_DIR"

if [ ! -d "$PROJECT_DIR" ]; then
    error "Directorio del proyecto no encontrado"
    info "Clonando repositorio..."
    mkdir -p /home/psiconervio/ecomerce/
    cd /home/psiconervio/ecomerce/
    git clone https://github.com/LaboratorioInnovacion/Next-modern-shop.git
fi

cd "$PROJECT_DIR"
success "En el directorio: $(pwd)"

# Actualizar código
info "Actualizando código desde GitHub..."
git fetch origin main
git reset --hard origin/main
success "Código actualizado"

# Verificar archivos Docker
info "Verificando archivos Docker..."
if [ -f "Dockerfile" ]; then
    success "Dockerfile encontrado"
else
    error "Dockerfile no encontrado"
    exit 1
fi

if [ -f "docker-compose.prod.yml" ]; then
    success "docker-compose.prod.yml encontrado"
else
    error "docker-compose.prod.yml no encontrado - usando docker-compose.yml"
    COMPOSE_FILE="docker-compose.yml"
fi

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"

# Verificar Docker
info "Verificando Docker..."
if command -v docker &> /dev/null; then
    success "Docker instalado: $(docker --version)"
else
    error "Docker no está instalado"
    info "Instalando Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    systemctl start docker
    systemctl enable docker
    usermod -aG docker $(whoami)
    success "Docker instalado"
fi

if command -v docker-compose &> /dev/null; then
    success "Docker Compose instalado: $(docker-compose --version)"
else
    error "Docker Compose no está instalado"
    info "Instalando Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    success "Docker Compose instalado"
fi

# Crear archivo .env si no existe
info "Configurando variables de entorno..."
if [ ! -f ".env" ]; then
    info "Creando archivo .env..."
    cat > .env << EOF
NODE_ENV=production
DATABASE_URL=postgresql://postgres:postgres_secure_2024@postgres:5432/ecommerce
NEXTAUTH_URL=http://186.12.205.69:3000
NEXTAUTH_SECRET=$(openssl rand -base64 32)
SECRET=$(openssl rand -base64 32)
MERCADOPAGO_ACCESS_TOKEN=APP_USR-3904014073520705-081821-ac9642583a0c52da7c3d6aae0fa8eafe-2631277847
NEXT_PUBLIC_URL=http://186.12.205.69:3000
POSTGRES_PASSWORD=postgres_secure_2024
EOF
    success "Archivo .env creado"
else
    success "Archivo .env ya existe"
fi

# Parar contenedores existentes
info "Deteniendo contenedores existentes (si los hay)..."
docker-compose -f "$COMPOSE_FILE" down 2>/dev/null || true

# Limpiar recursos Docker no utilizados
info "Limpiando recursos Docker..."
docker system prune -f

# Construir y levantar contenedores
info "Construyendo y levantando contenedores..."
echo "🏗️  Esto puede tomar varios minutos..."
if docker-compose -f "$COMPOSE_FILE" up -d --build; then
    success "Contenedores construidos y levantados!"
else
    error "Error al construir/levantar contenedores"
    exit 1
fi

# Esperar a que los servicios estén listos
info "Esperando a que los servicios estén listos..."
sleep 30

# Verificar estado de los contenedores
info "Verificando estado de los contenedores..."
docker-compose -f "$COMPOSE_FILE" ps

# Verificar que la aplicación responde
info "Verificando que la aplicación responde..."
for i in {1..10}; do
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        success "¡Aplicación respondiendo correctamente!"
        break
    else
        info "Intento $i/10: Esperando respuesta de la aplicación..."
        sleep 10
    fi
done

# Mostrar logs finales
info "Mostrando logs de los últimos 20 segundos..."
docker-compose -f "$COMPOSE_FILE" logs --tail=50

echo ""
echo "🎉 ¡DESPLIEGUE COMPLETADO!"
echo "================================"
echo "🌐 Tu aplicación está disponible en:"
echo "   http://186.12.205.69:3000"
echo ""
echo "📊 Comandos útiles:"
echo "   Ver logs:     docker-compose -f $COMPOSE_FILE logs -f"
echo "   Ver estado:   docker-compose -f $COMPOSE_FILE ps"
echo "   Reiniciar:    docker-compose -f $COMPOSE_FILE restart"
echo "   Parar:        docker-compose -f $COMPOSE_FILE down"
echo ""
echo "🔧 Para acceder a la base de datos:"
echo "   docker-compose -f $COMPOSE_FILE exec postgres psql -U postgres -d ecommerce"
echo ""

# Test final de conectividad
if curl -s http://186.12.205.69:3000 > /dev/null; then
    success "✅ Todo funcionando perfectamente!"
    echo "🚀 Puedes acceder a tu aplicación desde cualquier lugar en: http://186.12.205.69:3000"
else
    error "⚠️  La aplicación puede no estar respondiendo aún. Dale unos minutos más."
fi