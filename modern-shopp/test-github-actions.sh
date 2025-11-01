#!/bin/bash

# Script para probar GitHub Actions desde el servidor
echo "🧪 Probando GitHub Actions desde el servidor..."

cd /home/psiconervio/ecomerce/Next-modern-shop/modern-shopp

# Verificar que estamos en un repo git
if [ ! -d ".git" ]; then
    echo "❌ Error: No estás en un repositorio Git"
    echo "🔄 Clonando repositorio..."
    cd ..
    rm -rf modern-shopp 2>/dev/null
    git clone https://github.com/LaboratorioInnovacion/Next-modern-shop.git temp-repo
    cp -r temp-repo/* .
    rm -rf temp-repo
    cd modern-shopp
fi

# Configurar git si no está configurado
git config --global user.email "admin@servidor.com" 2>/dev/null || true
git config --global user.name "Servidor Admin" 2>/dev/null || true

# Hacer un pequeño cambio para probar
echo "" >> README.md
echo "## Test GitHub Actions desde Servidor" >> README.md
echo "Fecha: $(date)" >> README.md

# Commit y push
git add .
git commit -m "Test GitHub Actions desde servidor - $(date)"
git push origin main

echo "✅ Push realizado!"
echo "🔍 Ve el progreso en: https://github.com/LaboratorioInnovacion/Next-modern-shop/actions"