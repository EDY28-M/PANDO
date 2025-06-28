# 🚀 Guía de Despliegue - Kera AI Cuentas

## Despliegue en Google Cloud Platform

### 📋 Prerrequisitos

1. **Cuenta de Google Cloud Platform**
   - Crear cuenta en [console.cloud.google.com](https://console.cloud.google.com)
   - Habilitar facturación

2. **Google Cloud CLI**
   - Instalar desde: https://cloud.google.com/sdk/docs/install
   - Autenticarse: `gcloud auth login`

3. **Configuración de Email**
   - Configurar variables de entorno para Gmail SMTP
   - Usar contraseñas de aplicación de Gmail

### 🔧 Configuración Inicial

#### 1. Crear Proyecto en Google Cloud
```bash
# Crear nuevo proyecto
gcloud projects create kera-ai-cuentas-[ID-UNICO]

# Configurar proyecto
gcloud config set project kera-ai-cuentas-[ID-UNICO]
```

#### 2. Habilitar APIs Necesarias
```bash
gcloud services enable appengine.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

#### 3. Configurar Variables de Entorno
Crear archivo `.env` en producción o configurar en Google Cloud:

```env
GMAIL_USER=tu-email@gmail.com
GMAIL_PASS=tu-contraseña-de-aplicación
NODE_ENV=production
PORT=8080
```

### 🚀 Despliegue Automático

#### Opción 1: Script Automatizado
```bash
# Dar permisos de ejecución
chmod +x deploy.sh

# Editar PROJECT_ID en deploy.sh
# Ejecutar despliegue
./deploy.sh
```

#### Opción 2: Comandos Manuales
```bash
# Desplegar aplicación
gcloud app deploy

# Ver logs
gcloud app logs tail -s default

# Abrir aplicación
gcloud app browse
```

### 📁 Estructura de Archivos para Despliegue

```
PANDO/
├── app.yaml              # Configuración de App Engine
├── .gcloudignore         # Archivos a ignorar
├── Dockerfile            # Contenedorización (opcional)
├── deploy.sh             # Script de despliegue
├── package.json          # Dependencias y scripts
├── server.js             # Servidor principal
├── config/
│   └── email.js          # Configuración de email
├── css/                  # Estilos
├── js/                   # JavaScript
├── images/               # Imágenes
└── index.html            # Página principal
```

### 🔒 Configuración de Seguridad

#### 1. Variables de Entorno en App Engine
```yaml
# En app.yaml
env_variables:
  GMAIL_USER: "tu-email@gmail.com"
  GMAIL_PASS: "tu-contraseña-de-aplicación"
  NODE_ENV: "production"
```

#### 2. Configurar Gmail App Password
1. Ir a [myaccount.google.com](https://myaccount.google.com)
2. Seguridad > Verificación en 2 pasos
3. Contraseñas de aplicación
4. Generar nueva contraseña para la aplicación

### 📊 Monitoreo y Logs

#### Ver Logs en Tiempo Real
```bash
gcloud app logs tail -s default
```

#### Ver Métricas
- Ir a [App Engine Console](https://console.cloud.google.com/appengine)
- Sección "Versiones" para ver rendimiento
- Sección "Logs" para debugging

### 🔄 Actualizaciones

#### Desplegar Nueva Versión
```bash
# Desplegar cambios
gcloud app deploy

# Verificar nueva versión
gcloud app versions list
```

#### Rollback a Versión Anterior
```bash
# Listar versiones
gcloud app versions list

# Hacer rollback
gcloud app services set-traffic default --splits=[VERSION-ID]=1.0
```

### 💰 Costos Estimados

**App Engine (F1 - Micro Instance)**
- CPU: 0.2 vCPU
- Memoria: 256 MB
- Costo: ~$0.05/hora (~$36/mes)
- Incluye 28 horas gratuitas/mes

**Escalado Automático**
- Mínimo: 1 instancia
- Máximo: 10 instancias
- Solo paga por lo que usa

### 🛠️ Troubleshooting

#### Error: "Permission denied"
```bash
# Verificar permisos
gcloud auth list
gcloud config get-value project
```

#### Error: "API not enabled"
```bash
# Habilitar APIs
gcloud services enable appengine.googleapis.com
```

#### Error: "Port already in use"
- Verificar que no haya otro proceso en puerto 8080
- App Engine usa automáticamente el puerto correcto

### 📞 Soporte

- **Google Cloud Support**: https://cloud.google.com/support
- **App Engine Docs**: https://cloud.google.com/appengine/docs
- **Community**: https://stackoverflow.com/questions/tagged/google-app-engine

### ✅ Checklist de Despliegue

- [ ] Cuenta de Google Cloud creada
- [ ] Facturación habilitada
- [ ] Google Cloud CLI instalado
- [ ] Proyecto creado y configurado
- [ ] APIs habilitadas
- [ ] Variables de entorno configuradas
- [ ] Gmail app password configurado
- [ ] Aplicación desplegada exitosamente
- [ ] Logs verificados
- [ ] Funcionalidad de email probada
- [ ] SSL/HTTPS funcionando
- [ ] Dominio personalizado configurado (opcional)

---

**¡Tu aplicación Kera AI Cuentas está lista para producción! 🎉** 