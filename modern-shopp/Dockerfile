FROM node:20-alpine AS builder
WORKDIR /app

# Instalar dependencias del sistema (incluye Chromium para Puppeteer)
RUN apk add --no-cache \
    libc6-compat \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Copiar archivos de configuración
COPY package*.json ./
COPY prisma ./prisma/

# Configurar npm para mejor conectividad y instalar dependencias con reintentos
RUN npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-retries 5 && \
    npm ci --production=false --prefer-offline --no-audit --no-fund

# Generar Prisma Client
RUN npx prisma generate

# Copiar el resto del código
COPY . .

# Construir aplicación
RUN npm run build

# Etapa de producción
FROM node:20-alpine AS runner
WORKDIR /app

# Instalar Chromium para Puppeteer en producción
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar archivos necesarios
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json

# Instalar Prisma Client en producción (evitar fallos por peer deps en el runner)
RUN npm install --no-audit --no-fund --legacy-peer-deps @prisma/client
RUN npx prisma generate

# Cambiar permisos
USER nextjs

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV HOSTNAME=0.0.0.0

# Script de inicio que ejecuta migraciones y luego inicia la app
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]