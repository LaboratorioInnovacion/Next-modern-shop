# Docker Setup - Next.js eCommerce App

## Descripción
Este proyecto incluye la configuración completa de Docker para ejecutar la aplicación Next.js con Prisma ORM y PostgreSQL.

## Estructura de Docker
- **nextjs**: Aplicación Next.js principal
- **postgres**: Base de datos PostgreSQL
- **pgadmin**: Interfaz web para administrar PostgreSQL (opcional)

## Requisitos Previos
- Docker
- Docker Compose

## Instrucciones de Uso

### 1. Construir y ejecutar los contenedores
```bash
# Construir y ejecutar en segundo plano
docker-compose up -d --build

# O ejecutar en primer plano para ver los logs
docker-compose up --build
```

### 2. Verificar que los servicios están funcionando
```bash
# Ver el estado de los contenedores
docker-compose ps

# Ver los logs de un servicio específico
docker-compose logs nextjs
docker-compose logs postgres
```

### 3. Acceder a los servicios
- **Aplicación Next.js**: http://localhost:3000
- **pgAdmin** (opcional): http://localhost:8080
  - Email: admin@admin.com
  - Password: admin

### 4. Ejecutar comandos de Prisma (si es necesario)
```bash
# Acceder al contenedor de la aplicación
docker-compose exec nextjs sh

# Dentro del contenedor, ejecutar comandos de Prisma
npx prisma studio
npx prisma db push
npx prisma migrate dev
```

### 5. Parar los servicios
```bash
# Parar los contenedores
docker-compose down

# Parar y eliminar volúmenes (¡CUIDADO! Esto eliminará los datos de la BD)
docker-compose down -v
```

## Configuración de Base de Datos

### Conexión Local (Docker)
La aplicación se conectará automáticamente a la base de datos PostgreSQL del contenedor usando:
```
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/ecommerce
```

### Configuración de pgAdmin
Si quieres conectarte a la base de datos desde pgAdmin:
1. Ve a http://localhost:8080
2. Inicia sesión con admin@admin.com / admin
3. Agrega un nuevo servidor con:
   - Host: postgres
   - Puerto: 5432
   - Usuario: postgres
   - Contraseña: postgres
   - Base de datos: ecommerce

## Variables de Entorno
Las variables de entorno están configuradas en el `docker-compose.yml`. Si necesitas modificarlas:

1. Para desarrollo local, puedes crear un archivo `.env.local`
2. Para producción, modifica las variables en el `docker-compose.yml`

## Troubleshooting

### Error de conexión a la base de datos
Si obtienes errores de conexión:
```bash
# Reinicia los contenedores
docker-compose restart

# Verifica que PostgreSQL esté funcionando
docker-compose logs postgres
```

### Limpiar todo y empezar desde cero
```bash
# Eliminar contenedores, imágenes y volúmenes
docker-compose down -v
docker system prune -a
docker-compose up --build
```

### Ver logs en tiempo real
```bash
# Logs de todos los servicios
docker-compose logs -f

# Logs de un servicio específico
docker-compose logs -f nextjs
```

## Notas Importantes

1. **Datos Persistentes**: Los datos de PostgreSQL se almacenan en un volumen de Docker y persistirán entre reinicios.

2. **Migraciones**: Las migraciones de Prisma se ejecutan automáticamente cuando se inicia el contenedor de la aplicación.

3. **Desarrollo**: Para desarrollo, podrías preferir usar `docker-compose up` sin `-d` para ver los logs en tiempo real.

4. **Producción**: Para producción, asegúrate de cambiar las contraseñas y secretos por valores seguros.

5. **Puerto 3000**: Asegúrate de que el puerto 3000 no esté siendo usado por otra aplicación.