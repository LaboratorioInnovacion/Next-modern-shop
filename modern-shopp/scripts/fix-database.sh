#!/bin/bash

# Script para reiniciar los servicios y aplicar las credenciales corregidas

echo "🔄 Reiniciando servicios con credenciales corregidas..."

# Detener todos los contenedores
echo "⏹️ Deteniendo contenedores..."
docker-compose -f docker-compose.prod.yml down

# Limpiar volúmenes de la base de datos (SOLO si quieres empezar limpio)
read -p "⚠️ ¿Quieres limpiar la base de datos existente? (Esto eliminará todos los datos) [y/N]: " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🗑️ Eliminando volumen de base de datos..."
    docker volume rm modern-shopp_postgres_data 2>/dev/null || true
fi

# Iniciar servicios
echo "🚀 Iniciando servicios..."
docker-compose -f docker-compose.prod.yml up -d

# Esperar a que PostgreSQL esté listo
echo "⏳ Esperando a que PostgreSQL esté listo..."
sleep 30

# Verificar conexión a la base de datos
echo "🔍 Verificando conexión a la base de datos..."
if docker-compose -f docker-compose.prod.yml exec -T postgres pg_isready -U postgres; then
    echo "✅ PostgreSQL está listo"
else
    echo "❌ PostgreSQL no responde"
    exit 1
fi

# Ejecutar migraciones de Prisma
echo "🔄 Ejecutando migraciones de Prisma..."
docker-compose -f docker-compose.prod.yml exec -T nextjs npx prisma migrate deploy

# Generar cliente Prisma
echo "🔄 Generando cliente Prisma..."
docker-compose -f docker-compose.prod.yml exec -T nextjs npx prisma generate

# Verificar que la aplicación esté funcionando
echo "🔍 Verificando aplicación..."
sleep 10
if curl -s http://localhost:8081/health > /dev/null; then
    echo "✅ La aplicación está funcionando correctamente"
    echo "🌐 Accede a: http://localhost:8081"
else
    echo "⚠️ La aplicación aún no responde, revisa los logs:"
    echo "📋 docker-compose -f docker-compose.prod.yml logs"
fi

echo "🎉 Proceso completado!"