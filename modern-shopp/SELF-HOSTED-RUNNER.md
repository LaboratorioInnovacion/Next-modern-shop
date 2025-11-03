# GitHub Self-Hosted Runner Setup

## ¿Por qué Self-Hosted Runner?
- Tu servidor está en WSL2 (IP privada)
- SSH solo accesible vía Tailscale
- Los runners de GitHub no pueden llegar a tu red privada
- Self-hosted runner corre en tu máquina y tiene acceso directo

## Configuración Paso a Paso

### 1. Crear el Runner en GitHub
1. Ve a: https://github.com/LaboratorioInnovacion/Next-modern-shop/settings/actions/runners
2. Clic en "New self-hosted runner"
3. Selecciona "Linux"
4. Copia los comandos que aparecen

### 2. Instalar en tu WSL2
```bash
# En tu WSL2/Ubuntu
cd /home/psiconervio/
mkdir actions-runner && cd actions-runner

# Descargar (los comandos exactos aparecen en GitHub)
curl -o actions-runner-linux-x64-2.311.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-linux-x64-2.311.0.tar.gz
tar xzf ./actions-runner-linux-x64-2.311.0.tar.gz

# Configurar (usa el token que aparece en GitHub)
./config.sh --url https://github.com/LaboratorioInnovacion/Next-modern-shop --token TU_TOKEN_AQUI

# Instalar como servicio
sudo ./svc.sh install
sudo ./svc.sh start
```

### 3. Verificar que Funciona
```bash
# Ver estado
sudo ./svc.sh status

# Ver logs
sudo journalctl -u actions.runner.* -f
```

## Ventajas
✅ Acceso directo a Docker en WSL2
✅ No problemas de red/firewall
✅ Más rápido (no descarga código)
✅ Acceso a recursos locales