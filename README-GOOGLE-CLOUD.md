# 🌐 PANDO - Guía de Deployment en Google Cloud Platform

Esta guía detalla cómo configurar y desplegar el proyecto PANDO en Google Cloud Platform usando Google Cloud SQL (MySQL) y App Engine.

## 📋 Índice

1. [Requisitos Previos](#requisitos-previos)
2. [Configuración de Google Cloud](#configuración-de-google-cloud)
3. [Configuración de Cloud SQL](#configuración-de-cloud-sql)
4. [Configuración del Proyecto](#configuración-del-proyecto)
5. [Deployment](#deployment)
6. [Verificación](#verificación)
7. [Mantenimiento](#mantenimiento)
8. [Troubleshooting](#troubleshooting)

## 🔧 Requisitos Previos

### Software Necesario
- **Node.js** 20.x o superior
- **Google Cloud CLI** (gcloud)
- **Git** (opcional, para control de versiones)

### Cuenta de Google Cloud
- Proyecto de Google Cloud creado
- Facturación habilitada
- APIs necesarias habilitadas

## 🌐 Configuración de Google Cloud

### 1. Instalar Google Cloud CLI

**Windows:**
```powershell
# Descargar desde: https://cloud.google.com/sdk/docs/install-sdk
# O usar Chocolatey:
choco install gcloudsdk
```

**macOS/Linux:**
```bash
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
```

### 2. Autenticación y Configuración

```bash
# Autenticarse
gcloud auth login

# Configurar proyecto
gcloud config set project TU_PROYECTO_ID

# Verificar configuración
gcloud config list
```

### 3. Habilitar APIs Necesarias

```bash
# APIs requeridas
gcloud services enable sqladmin.googleapis.com
gcloud services enable appengine.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

### 4. Inicializar App Engine

```bash
# Inicializar App Engine (solo primera vez)
gcloud app create --region=us-central
```

## 🗄️ Configuración de Cloud SQL

### 1. Crear Instancia de Cloud SQL

```bash
# Crear instancia MySQL
gcloud sql instances create pando-mysql \
  --database-version=MYSQL_8_0 \
  --tier=db-f1-micro \
  --region=us-central1 \
  --storage-type=SSD \
  --storage-size=10GB \
  --backup-start-time=03:00 \
  --enable-bin-log \
  --maintenance-window-day=SUN \
  --maintenance-window-hour=04
```

### 2. Crear Base de Datos

```bash
# Crear base de datos
gcloud sql databases create pando_db --instance=pando-mysql
```

### 3. Configurar Usuario y Contraseña

```bash
# Establecer contraseña para root
gcloud sql users set-password root \
  --host=% \
  --instance=pando-mysql \
  --password=TU_CONTRASEÑA_SEGURA

# O crear un usuario específico
gcloud sql users create pando_user \
  --instance=pando-mysql \
  --password=TU_CONTRASEÑA_SEGURA
```

### 4. Obtener Información de Conexión

```bash
# Obtener nombre de conexión
gcloud sql instances describe pando-mysql --format="value(connectionName)"
# Resultado: tu-proyecto:us-central1:pando-mysql
```

## ⚙️ Configuración del Proyecto

### 1. Clonar o Descargar el Proyecto

```bash
# Si usas Git
git clone TU_REPOSITORIO
cd pando

# O descomprimir el archivo ZIP
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

#### Para Desarrollo Local (.env):
```env
# Configuración de Email
GMAIL_USER=tu-email@gmail.com
GMAIL_PASS=tu-contraseña-de-aplicacion

# Configuración del Servidor
NODE_ENV=development
PORT=3000

# Configuración de Base de Datos Local (Opcional)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu-contraseña-local
DB_NAME=pando_db

# Configuración de Google Cloud
GOOGLE_CLOUD_PROJECT=tu-proyecto-id
CLOUD_SQL_CONNECTION_NAME=tu-proyecto:us-central1:pando-mysql
```

#### Para Producción (app.yaml):
```yaml
runtime: nodejs20
service: default

env_variables:
  NODE_ENV: production
  PORT: 8080
  GMAIL_USER: "tu-email@gmail.com"
  GMAIL_PASS: "tu-contraseña-de-aplicacion"
  
  # Configuración de Google Cloud SQL
  GOOGLE_CLOUD_PROJECT: "tu-proyecto-id"
  CLOUD_SQL_CONNECTION_NAME: "tu-proyecto:us-central1:pando-mysql"
  DB_USER: "root"
  DB_PASSWORD: "tu-contraseña-mysql"
  DB_NAME: "pando_db"

# Configuración automática de instancias
automatic_scaling:
  target_cpu_utilization: 0.65
  min_instances: 1
  max_instances: 5

# Recursos del servidor
resources:
  cpu: 1
  memory_gb: 0.5
  disk_size_gb: 10

# Configuración de Cloud SQL Proxy
beta_settings:
  cloud_sql_instances: "tu-proyecto:us-central1:pando-mysql"

# Manejadores de URL
handlers:
  - url: /.*
    script: auto
    secure: always

# Servicios adicionales
inbound_services:
  - warmup
```

### 4. Configurar Email de Gmail

1. **Activar verificación en 2 pasos** en tu cuenta de Gmail
2. **Generar contraseña de aplicación**:
   - Ve a [Contraseñas de aplicación](https://myaccount.google.com/apppasswords)
   - Selecciona "Otra aplicación personalizada"
   - Nombra: "PANDO App"
   - Usa la contraseña generada en `GMAIL_PASS`

## 🚀 Deployment

### Opción 1: Deployment Manual

```bash
# 1. Preparar el proyecto
npm install --production

# 2. Configurar la base de datos
node setup-gcp-database.js

# 3. Verificar configuración
npm run test-config

# 4. Desplegar
gcloud app deploy

# 5. Abrir la aplicación
gcloud app browse
```

### Opción 2: Deployment Automatizado

```bash
# Hacer el script ejecutable (Linux/macOS)
chmod +x deploy-gcp.sh

# Ejecutar con creación de Cloud SQL
./deploy-gcp.sh --create-sql

# O deployment simple
./deploy-gcp.sh
```

### Opción 3: Usando NPM Scripts

```bash
# Crear instancia de Cloud SQL
npm run cloud-sql:create

# Configurar base de datos
npm run cloud-sql:setup

# Probar conexión
npm run test-db

# Desplegar
npm run deploy
```

## ✅ Verificación

### 1. Verificar Deployment

```bash
# Ver el estado de la aplicación
gcloud app describe

# Ver versiones desplegadas
gcloud app versions list

# Ver logs en tiempo real
gcloud app logs tail -s default
```

### 2. Probar la Aplicación

- **Sitio web principal**: `https://TU_PROYECTO_ID.uc.r.appspot.com`
- **Panel de administración**: `https://TU_PROYECTO_ID.uc.r.appspot.com/admin.html`

### 3. Verificar Base de Datos

```bash
# Conectar a Cloud SQL
gcloud sql connect pando-mysql --user=root

# En MySQL shell:
USE pando_db;
SHOW TABLES;
SELECT COUNT(*) FROM contact_submissions;
```

### 4. Probar Funcionalidades

1. **Enviar contacto** desde el sitio web principal
2. **Verificar email** de notificación
3. **Revisar admin panel** para ver el contacto
4. **Probar cambios de estado** en el admin
5. **Verificar analíticas** y estadísticas

## 🔧 Mantenimiento

### Comandos Útiles

```bash
# Ver logs
gcloud app logs tail -s default

# Abrir aplicación
gcloud app browse

# Conectar a base de datos
gcloud sql connect pando-mysql --user=root

# Ver métricas
gcloud app describe

# Gestionar versiones
gcloud app versions list
gcloud app versions delete VERSION_ID
```

### Backup de Base de Datos

```bash
# Crear backup manual
gcloud sql backups create --instance=pando-mysql

# Listar backups
gcloud sql backups list --instance=pando-mysql

# Restaurar backup
gcloud sql backups restore BACKUP_ID --restore-instance=pando-mysql
```

### Escalado

```bash
# Cambiar recursos en app.yaml y redesplegar
# O usar comandos directos:

# Cambiar instancias mínimas
gcloud app versions update --min-instances=2 VERSION_ID

# Cambiar configuración de escalado
# Editar app.yaml y ejecutar: gcloud app deploy
```

## 🚨 Troubleshooting

### Problemas Comunes

#### 1. Error de Conexión a Cloud SQL

**Síntomas**: `ENOTFOUND` o `Connection refused`

**Soluciones**:
```bash
# Verificar que Cloud SQL esté activo
gcloud sql instances describe pando-mysql

# Verificar configuración en app.yaml
grep -n "CLOUD_SQL_CONNECTION_NAME" app.yaml

# Probar conexión local
node -e "require('./config/gcp-database').testConnection()"
```

#### 2. Error de Autenticación de Base de Datos

**Síntomas**: `ER_ACCESS_DENIED_ERROR`

**Soluciones**:
```bash
# Verificar usuario y contraseña
gcloud sql users list --instance=pando-mysql

# Resetear contraseña
gcloud sql users set-password root \
  --host=% \
  --instance=pando-mysql \
  --password=NUEVA_CONTRASEÑA
```

#### 3. Error de Email

**Síntomas**: Email no se envía

**Soluciones**:
1. Verificar contraseña de aplicación Gmail
2. Verificar configuración en app.yaml
3. Probar con: `npm run test-email`

#### 4. Error de Deployment

**Síntomas**: `gcloud app deploy` falla

**Soluciones**:
```bash
# Verificar sintaxis de app.yaml
gcloud app deploy --validate-only

# Ver logs detallados
gcloud app deploy --verbosity=debug

# Verificar APIs habilitadas
gcloud services list --enabled
```

### Logs y Monitoreo

```bash
# Logs de aplicación
gcloud app logs tail -s default

# Logs de Cloud SQL
gcloud sql operations list --instance=pando-mysql

# Métricas en Google Cloud Console
# https://console.cloud.google.com/monitoring
```

### Contacto y Soporte

- **Documentación de Google Cloud**: https://cloud.google.com/docs
- **Soporte de App Engine**: https://cloud.google.com/appengine/docs
- **Soporte de Cloud SQL**: https://cloud.google.com/sql/docs

---

## 📝 Notas Adicionales

### Costos Aproximados

- **App Engine**: ~$5-20/mes (dependiendo del tráfico)
- **Cloud SQL (db-f1-micro)**: ~$10-15/mes
- **Almacenamiento**: ~$1-5/mes

### Seguridad

- Todas las conexiones usan HTTPS
- Base de datos solo accesible desde App Engine
- Contraseñas almacenadas como variables de entorno
- Rate limiting para emails

### Performance

- Auto-scaling configurado
- Pool de conexiones de base de datos
- Caching de consultas frecuentes
- Optimización de imágenes estáticas

---

**¡Listo!** Tu aplicación PANDO ahora está desplegada en Google Cloud Platform con Cloud SQL. 🎉
