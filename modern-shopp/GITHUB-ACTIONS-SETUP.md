# 🚀 Configuración GitHub Actions - Guía Paso a Paso

## 📋 **Requisitos Previos**
- ✅ Servidor Linux con Docker instalado
- ✅ Tu proyecto ya clonado en el servidor
- ✅ Acceso SSH al servidor

## 🔧 **Paso 1: Configurar SSH en el Servidor**

### En tu servidor Linux, ejecuta:

```bash
# 1. Ir al directorio del proyecto
cd /ruta/a/tu/proyecto/Next-modern-shop/modern-shopp

# 2. Ejecutar script de configuración SSH
chmod +x setup-ssh.sh
./setup-ssh.sh
```

### ⚠️ **IMPORTANTE: Guarda la información que muestre el script**

El script te dará algo como:
```
HOST: 192.168.1.100
USERNAME: ubuntu
PORT: 22  
PROJECT_PATH: /home/ubuntu
SSH_KEY: -----BEGIN OPENSSH PRIVATE KEY----- ...
```

## 🔑 **Paso 2: Configurar Secrets en GitHub**

1. **Ve a tu repositorio en GitHub**
2. **Clic en Settings** (pestaña del repositorio)
3. **Clic en Secrets and variables > Actions**
4. **Clic en "New repository secret"**

### Agrega estos 5 secrets:

| Name | Value | Ejemplo |
|------|-------|---------|
| `HOST` | IP de tu servidor | `192.168.1.100` |
| `USERNAME` | Usuario SSH | `ubuntu` |
| `SSH_KEY` | Clave privada completa | `-----BEGIN OPENSSH...` |
| `PORT` | Puerto SSH (normalmente 22) | `22` |
| `PROJECT_PATH` | Ruta donde está el proyecto | `/home/ubuntu` |

### 📸 **Capturas de Pantalla de Referencia:**

```
GitHub > Tu Repo > Settings > Secrets and variables > Actions > New repository secret

Nombre: HOST
Valor: 192.168.1.100

Nombre: USERNAME  
Valor: ubuntu

Nombre: SSH_KEY
Valor: -----BEGIN OPENSSH PRIVATE KEY-----
       b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAA...
       (toda la clave privada que mostró el script)
       -----END OPENSSH PRIVATE KEY-----

Nombre: PORT
Valor: 22

Nombre: PROJECT_PATH
Valor: /home/ubuntu
```

## ✅ **Paso 3: Verificar Configuración**

### Test de SSH desde GitHub Actions:

1. **Ve a Actions** en tu repositorio
2. **Clic en "🚀 Deploy to Production Server"**
3. **Clic en "Run workflow"**
4. **Selecciona "main" branch**
5. **Clic en "Run workflow"**

## 🎯 **Paso 4: ¡Ya Está Configurado!**

Ahora **cada vez que hagas push a main**:

```bash
# En tu máquina local
git add .
git commit -m "Actualización de la aplicación"  
git push origin main
```

**Se ejecutará automáticamente:**
1. 📥 Descarga el código nuevo
2. 🛑 Para los contenedores actuales  
3. 🏗️ Construye la nueva versión
4. 🚀 Levanta los nuevos contenedores
5. ✅ Verifica que todo funcione
6. 🔄 Hace rollback si algo falla

## 📊 **Monitoreo**

### Ver el progreso del deploy:
1. Ve a **Actions** en GitHub
2. Clic en el workflow que se está ejecutando
3. Ver logs en tiempo real

### Ver estado en el servidor:
```bash
# Conectar por SSH
ssh usuario@tu-servidor

# Ver contenedores
cd Next-modern-shop/modern-shopp
docker-compose -f docker-compose.prod.yml ps

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f
```

## 🚨 **Solución de Problemas**

### ❌ Error de SSH
```
Error: ssh: connect to host X.X.X.X port 22: Connection refused
```
**Solución:**
- Verifica que el secret `HOST` sea la IP correcta
- Verifica que el secret `PORT` sea correcto (normalmente 22)
- Verifica que SSH esté habilitado en tu servidor

### ❌ Error de Autenticación  
```
Error: Permission denied (publickey)
```
**Solución:**
- Verifica que copiaste toda la clave privada en el secret `SSH_KEY`
- Verifica que el secret `USERNAME` sea correcto
- Ejecuta el script `setup-ssh.sh` de nuevo

### ❌ Error de Permisos
```
Error: Permission denied
```
**Solución:**
```bash
# En tu servidor
sudo chown -R $USER:$USER /home/$USER/Next-modern-shop/
chmod +x /home/$USER/Next-modern-shop/modern-shopp/*.sh
```

### ❌ Error de Docker
```
Error: docker-compose command not found
```
**Solución:**
```bash
# En tu servidor, instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

## 🎉 **¡Listo!**

Tu flujo de trabajo ahora es:
1. 💻 **Desarrollas** en local
2. 📤 **Push** a GitHub  
3. 🤖 **GitHub Actions** despliega automáticamente
4. 🌐 **Tu app** se actualiza en el servidor

### URLs importantes:
- **Tu aplicación:** `http://TU_IP:3000`
- **GitHub Actions:** `https://github.com/TU_USUARIO/Next-modern-shop/actions`

## 🔄 **Funciones Avanzadas**

### Deploy Manual (sin hacer push):
1. Ve a Actions > "🚀 Deploy to Production Server"
2. Clic en "Run workflow"  
3. Marca "Forzar despliegue completo" si quieres
4. Clic en "Run workflow"

### Rollback Automático:
- Si algo falla, automáticamente vuelve a la versión anterior
- Los logs te dirán exactamente qué pasó

¡Ya tienes un sistema de despliegue profesional! 🚀