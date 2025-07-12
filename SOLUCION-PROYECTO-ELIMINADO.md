# 🚨 SOLUCIÓN: Proyecto GCP Eliminado

## Problema Identificado

El error que estás experimentando:
```
denied: denied: Project #483569217524 has been deleted.
```

Indica que el proyecto GCP `ascendant-altar-457900-v4` fue eliminado, por lo que todos los deployments fallan.

## ✅ Solución Implementada

He actualizado todos los archivos de configuración para usar tu nuevo proyecto:

### Nuevo Proyecto GCP
- **PROJECT_ID**: `luminous-style-465017-v6`
- **PROJECT_NUMBER**: `565241049736`
- **SERVICE_ACCOUNT**: `565241049736-compute@developer.gserviceaccount.com`
- **REGIÓN**: `europe-west1`

### Archivos Actualizados

1. **`.github/workflows/deploy.yml`** ✅
   - PROJECT_ID actualizado
   - Service account actualizado
   - Configuración de Cloud SQL actualizada

2. **`cloudbuild.yaml`** ✅
   - Configuración para Cloud Run (no App Engine)
   - Nuevas referencias del proyecto
   - Artifact Registry actualizado

3. **`cloudrun.yaml`** ✅
   - Todas las referencias del proyecto actualizadas
   - Service account correcto
   - Memoria ajustada a 512Mi (como tu configuración actual)

## 🔧 Pasos para Completar la Configuración

### 1. URGENTE: Solucionar Artifact Registry

El error que estás viendo indica problemas de permisos con Artifact Registry. Ejecuta este script primero:

```bash
# Hacer ejecutable el script
chmod +x fix-artifact-registry.sh

# Ejecutar solución específica para Artifact Registry
./fix-artifact-registry.sh
```

Este script:
- Crea el repositorio de Artifact Registry si no existe
- Configura todos los permisos necesarios
- Otorga permisos al service account y usuario
- Prueba la configuración

### 2. Ejecutar Script de Configuración General

```bash
# Hacer ejecutable el script
chmod +x fix-gcp-project.sh

# Ejecutar configuración automática
./fix-gcp-project.sh
```

Este script:
- Configura gcloud para el nuevo proyecto
- Habilita todas las APIs necesarias
- Configura Docker para Artifact Registry
- Verifica/crea el repositorio de contenedores
- Opcionalmente crea Cloud SQL

### 3. Configurar Secretos de Google Cloud

```bash
# Crear secretos necesarios
echo "tu-contraseña-mysql" | gcloud secrets create db-password --data-file=-
echo "tu-email@gmail.com" | gcloud secrets create gmail-user --data-file=-
echo "tu-contraseña-app-gmail" | gcloud secrets create gmail-pass --data-file=-
echo "tu-session-secret-seguro" | gcloud secrets create session-secret --data-file=-
```

### 4. Actualizar GitHub Secrets

Ve a tu repositorio GitHub → Settings → Secrets and variables → Actions:

**Actualizar/Crear:**
- `GCP_SA_KEY`: Clave JSON del service account del nuevo proyecto

**Para obtener la clave del service account:**
```bash
# Crear service account key
gcloud iam service-accounts keys create key.json \
  --iam-account=565241049736-compute@developer.gserviceaccount.com

# Copiar el contenido de key.json a GitHub Secrets
cat key.json
```

### 5. Configurar Cloud SQL (si no existe)

```bash
# Crear instancia
gcloud sql instances create pando-mysql \
  --database-version=MYSQL_8_0 \
  --tier=db-f1-micro \
  --region=europe-west1 \
  --storage-type=SSD \
  --storage-size=10GB

# Crear base de datos
gcloud sql databases create pando_db --instance=pando-mysql

# Configurar contraseña root
gcloud sql users set-password root \
  --host=% \
  --instance=pando-mysql \
  --password=TU_CONTRASEÑA_SEGURA
```

## 🚀 Probar el Deployment

### Opción 1: GitHub Actions (Recomendado)
```bash
# Hacer commit y push
git add .
git commit -m "Fix: Update GCP project configuration"
git push origin main
```

### Opción 2: Deployment Manual
```bash
# Configurar gcloud
gcloud config set project luminous-style-465017-v6

# Build y push de imagen
docker build -t europe-west1-docker.pkg.dev/luminous-style-465017-v6/cloud-run-source-deploy/pando/pando:latest .
docker push europe-west1-docker.pkg.dev/luminous-style-465017-v6/cloud-run-source-deploy/pando/pando:latest

# Deploy a Cloud Run
gcloud run deploy pando \
  --image europe-west1-docker.pkg.dev/luminous-style-465017-v6/cloud-run-source-deploy/pando/pando:latest \
  --region europe-west1 \
  --platform managed \
  --allow-unauthenticated
```

## 📋 Verificación

### 1. Verificar Servicio
```bash
# Ver servicios de Cloud Run
gcloud run services list --region=europe-west1

# Obtener URL del servicio
gcloud run services describe pando --region=europe-west1 --format="value(status.url)"
```

### 2. Probar la Aplicación
- Visita la URL del servicio
- Prueba el formulario de contacto
- Verifica el panel de administración

### 3. Ver Logs
```bash
# Logs de Cloud Run
gcloud logs read "resource.type=cloud_run_revision AND resource.labels.service_name=pando" --limit=50

# Logs en tiempo real
gcloud logs tail "resource.type=cloud_run_revision AND resource.labels.service_name=pando"
```

## 🔍 Troubleshooting

### Problema Actual: Permisos de Artifact Registry

**Error específico:**
```
denied: Permission "artifactregistry.repositories.uploadArtifacts" denied on resource "projects/luminous-style-465017-v6/locations/europe-west1/repositories/cloud-run-source-deploy" (or it may not exist)
```

**Soluciones:**

1. **Ejecutar el script de solución:**
   ```bash
   ./fix-artifact-registry.sh
   ```

2. **Verificar manualmente el repositorio:**
   ```bash
   # Listar repositorios existentes
   gcloud artifacts repositories list --location=europe-west1
   
   # Si no existe, crearlo
   gcloud artifacts repositories create cloud-run-source-deploy \
     --repository-format=docker \
     --location=europe-west1 \
     --description="Repository for PANDO Cloud Run deployments"
   ```

3. **Configurar permisos manualmente:**
   ```bash
   # Para tu usuario
   gcloud projects add-iam-policy-binding luminous-style-465017-v6 \
     --member="user:$(gcloud auth list --filter=status:ACTIVE --format='value(account)' | head -n1)" \
     --role="roles/artifactregistry.writer"
   
   # Para el service account
   gcloud projects add-iam-policy-binding luminous-style-465017-v6 \
     --member="serviceAccount:565241049736-compute@developer.gserviceaccount.com" \
     --role="roles/artifactregistry.writer"
   ```

4. **Reconfigurar Docker:**
   ```bash
   gcloud auth configure-docker europe-west1-docker.pkg.dev
   ```

5. **Actualizar credenciales de GitHub:**
   - Generar nueva clave del service account
   - Actualizar `GCP_SA_KEY` en GitHub Secrets

### Error de Permisos
```bash
# Verificar permisos del service account
gcloud projects get-iam-policy luminous-style-465017-v6
```

### Error de Artifact Registry
```bash
# Verificar repositorio
gcloud artifacts repositories list --location=europe-west1

# Configurar Docker auth
gcloud auth configure-docker europe-west1-docker.pkg.dev
```

### Error de Cloud SQL
```bash
# Verificar instancia
gcloud sql instances describe pando-mysql

# Probar conexión
gcloud sql connect pando-mysql --user=root
```

## 📊 Información del Proyecto

### URLs Importantes
- **Cloud Console**: https://console.cloud.google.com/home/dashboard?project=luminous-style-465017-v6
- **Cloud Run**: https://console.cloud.google.com/run?project=luminous-style-465017-v6
- **Cloud SQL**: https://console.cloud.google.com/sql/instances?project=luminous-style-465017-v6
- **Artifact Registry**: https://console.cloud.google.com/artifacts?project=luminous-style-465017-v6

### Configuración Actual
```yaml
Proyecto: luminous-style-465017-v6
Región: europe-west1
Servicio: pando
Imagen: europe-west1-docker.pkg.dev/luminous-style-465017-v6/cloud-run-source-deploy/pando/pando
Service Account: 565241049736-compute@developer.gserviceaccount.com
Cloud SQL: luminous-style-465017-v6:europe-west1:pando-mysql
```

## ✅ Resumen

1. ✅ **Archivos actualizados** con nuevo proyecto
2. 🔧 **Ejecutar** `./fix-gcp-project.sh`
3. 🔐 **Configurar secretos** de GCP y GitHub
4. 🚀 **Hacer push** para activar deployment
5. ✅ **Verificar** que todo funciona

¡Tu aplicación PANDO ahora debería deployarse correctamente en el nuevo proyecto GCP!
