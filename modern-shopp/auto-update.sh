#!/bin/bash

# Script para verificar actualizaciones automáticamente cada X minutos
# Uso: ./auto-update.sh

PROJECT_DIR="/home/$USER/Next-modern-shop/modern-shopp"
LOG_FILE="/var/log/auto-update.log"

echo "$(date): Verificando actualizaciones..." >> $LOG_FILE

cd $PROJECT_DIR

# Obtener el último commit local
LOCAL_COMMIT=$(git rev-parse HEAD)

# Obtener el último commit remoto
git fetch origin main
REMOTE_COMMIT=$(git rev-parse origin/main)

# Comparar commits
if [ "$LOCAL_COMMIT" != "$REMOTE_COMMIT" ]; then
    echo "$(date): Nueva versión detectada, actualizando..." >> $LOG_FILE
    
    # Actualizar código
    git pull origin main >> $LOG_FILE 2>&1
    
    # Reconstruir contenedores
    docker-compose -f docker-compose.prod.yml down >> $LOG_FILE 2>&1
    docker-compose -f docker-compose.prod.yml up -d --build >> $LOG_FILE 2>&1
    
    echo "$(date): Actualización completada!" >> $LOG_FILE
    
    # Opcional: Enviar notificación (requiere configurar sendmail)
    # echo "Aplicación actualizada en $(date)" | mail -s "Deploy Automático" tu@email.com
else
    echo "$(date): No hay actualizaciones" >> $LOG_FILE
fi