# 📸 Guía Visual - Configuración de Secrets en GitHub

## 🎯 Paso a Paso con Capturas

### 1. Ir a tu Repositorio
```
URL: https://github.com/LaboratorioInnovacion/Next-modern-shop
```

### 2. Hacer Clic en "Settings"
```
[Code] [Issues] [Pull requests] [Actions] [Projects] [Security] [Insights] [Settings] ← AQUÍ
```

### 3. En el Menu Lateral, ir a "Secrets and variables"
```
Sidebar Menu:
├── General
├── Collaborators  
├── Secrets and variables ← AQUÍ
│   └── Actions ← AQUÍ
├── Pages
└── ...
```

### 4. Hacer Clic en "New repository secret"
```
[New repository secret] ← Botón verde
```

### 5. Agregar Cada Secret (Repetir 5 veces)

#### Secret #1:
```
Name: HOST
Secret: 192.168.1.100  (tu IP del servidor)
[Add secret]
```

#### Secret #2:
```
Name: USERNAME  
Secret: ubuntu  (tu usuario SSH)
[Add secret]
```

#### Secret #3:
```
Name: PORT
Secret: 22
[Add secret]
```

#### Secret #4:
```
Name: PROJECT_PATH
Secret: /home/ubuntu  (ruta donde está el proyecto)
[Add secret]
```

#### Secret #5:
```
Name: SSH_KEY
Secret: -----BEGIN OPENSSH PRIVATE KEY-----
        b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAA...
        (TODA la clave privada que te dé el script)
        -----END OPENSSH PRIVATE KEY-----
[Add secret]
```

## ✅ Verificación Final

Cuando termines, deberías ver 5 secrets:

```
Repository secrets:
├── HOST              ••••••••••••
├── USERNAME          ••••••••••••  
├── PORT              ••••••••••••
├── PROJECT_PATH      ••••••••••••
└── SSH_KEY           ••••••••••••
```

## 🧪 Probar el Deploy

1. **Hacer un cambio cualquiera en tu código local**
2. **Push a GitHub:**
   ```bash
   git add .
   git commit -m "Test de GitHub Actions"
   git push origin main
   ```
3. **Ver el progreso:**
   ```
   https://github.com/LaboratorioInnovacion/Next-modern-shop/actions
   ```

## 🔍 Verificar que Funciona

Si todo está bien, verás:
- ✅ Workflow ejecutándose
- ✅ Logs del deploy
- ✅ Tu app actualizada en `http://TU_IP:3000`

## 🚨 Si Algo Sale Mal

### Error común: "Permission denied (publickey)"
**Solución:** Verifica que copiaste TODA la clave SSH_KEY completa

### Error común: "Host key verification failed"  
**Solución:** En tu servidor, ejecuta:
```bash
ssh-keyscan -H localhost >> ~/.ssh/known_hosts
```

### Error común: "docker-compose: command not found"
**Solución:** Instala Docker Compose en tu servidor

## 📞 ¿Necesitas Ayuda?

Si tienes problemas, comparte:
1. El error exacto de GitHub Actions
2. Los logs del workflow
3. El resultado del script `get-github-secrets.sh`