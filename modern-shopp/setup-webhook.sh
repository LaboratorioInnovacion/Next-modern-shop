#!/bin/bash

# Script para configurar webhook automático
# Este script debe ejecutarse en tu servidor Linux

echo "🔧 Configurando webhook para auto-deploy..."

# Crear directorio para el webhook
sudo mkdir -p /opt/webhook
cd /opt/webhook

# Crear script de deploy
sudo tee deploy-webhook.sh << 'EOF'
#!/bin/bash

# Log del webhook
LOG_FILE="/var/log/webhook-deploy.log"
echo "$(date): Webhook recibido, iniciando deploy..." >> $LOG_FILE

# Cambiar al directorio del proyecto
cd /home/$USER/Next-modern-shop/modern-shopp

# Actualizar código
git pull origin main >> $LOG_FILE 2>&1

# Reconstruir contenedores
docker-compose -f docker-compose.prod.yml down >> $LOG_FILE 2>&1
docker-compose -f docker-compose.prod.yml up -d --build >> $LOG_FILE 2>&1

echo "$(date): Deploy completado" >> $LOG_FILE
EOF

# Dar permisos
sudo chmod +x deploy-webhook.sh

# Instalar webhook (si no está instalado)
if ! command -v webhook &> /dev/null; then
    echo "Instalando webhook..."
    sudo apt update
    sudo apt install webhook -y
fi

# Crear configuración del webhook
sudo tee webhook-config.json << 'EOF'
[
  {
    "id": "deploy-ecommerce",
    "execute-command": "/opt/webhook/deploy-webhook.sh",
    "command-working-directory": "/opt/webhook",
    "response-message": "Deploy iniciado!",
    "trigger-rule": {
      "match": {
        "type": "payload-hash-sha1",
        "secret": "tu_secreto_webhook_aqui",
        "parameter": {
          "source": "header",
          "name": "X-Hub-Signature"
        }
      }
    }
  }
]
EOF

# Crear servicio systemd
sudo tee /etc/systemd/system/webhook-deploy.service << 'EOF'
[Unit]
Description=Webhook Deploy Service
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/webhook
ExecStart=/usr/bin/webhook -hooks webhook-config.json -verbose
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

# Habilitar y iniciar servicio
sudo systemctl daemon-reload
sudo systemctl enable webhook-deploy
sudo systemctl start webhook-deploy

echo "✅ Webhook configurado!"
echo "📡 El webhook estará disponible en: http://TU_IP:9000/hooks/deploy-ecommerce"
echo "🔑 Configura este webhook en GitHub con el secreto que definiste"