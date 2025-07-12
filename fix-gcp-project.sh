#!/bin/bash

# fix-gcp-project.sh - Script para configurar el nuevo proyecto GCP
# PANDO Project - Configuración rápida para luminous-style-465017-v6

set -e

echo "🔧 PANDO - Configuración del nuevo proyecto GCP"
echo "================================================"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Variables del nuevo proyecto
NEW_PROJECT_ID="luminous-style-465017-v6"
NEW_PROJECT_NUMBER="565241049736"
REGION="europe-west1"
SERVICE_NAME="pando"

print_status "Configurando proyecto: $NEW_PROJECT_ID"
print_status "Región: $REGION"
print_status "Servicio: $SERVICE_NAME"

# Verificar que gcloud esté instalado y configurado
if ! command -v gcloud &> /dev/null; then
    print_error "gcloud CLI no está instalado"
    exit 1
fi

# Configurar el proyecto
print_status "Configurando gcloud para el nuevo proyecto..."
gcloud config set project $NEW_PROJECT_ID
print_success "Proyecto configurado: $NEW_PROJECT_ID"

# Habilitar APIs necesarias
print_status "Habilitando APIs necesarias..."
gcloud services enable cloudbuild.googleapis.com --quiet
gcloud services enable run.googleapis.com --quiet
gcloud services enable sqladmin.googleapis.com --quiet
gcloud services enable artifactregistry.googleapis.com --quiet
gcloud services enable secretmanager.googleapis.com --quiet
print_success "APIs habilitadas"

# Configurar Docker para Artifact Registry
print_status "Configurando Docker para Artifact Registry..."
gcloud auth configure-docker europe-west1-docker.pkg.dev --quiet
print_success "Docker configurado"

# Verificar que el repositorio de Artifact Registry existe
print_status "Verificando repositorio de Artifact Registry..."
if gcloud artifacts repositories describe cloud-run-source-deploy --location=$REGION > /dev/null 2>&1; then
    print_success "Repositorio 'cloud-run-source-deploy' existe"
else
    print_warning "Repositorio 'cloud-run-source-deploy' no existe"
    print_status "Creando repositorio..."
    gcloud artifacts repositories create cloud-run-source-deploy \
        --repository-format=docker \
        --location=$REGION \
        --description="Repository for PANDO Cloud Run deployments"
    print_success "Repositorio creado"
fi

# Verificar Cloud SQL (opcional)
print_status "Verificando instancia de Cloud SQL..."
if gcloud sql instances describe pando-mysql --quiet > /dev/null 2>&1; then
    print_success "Instancia Cloud SQL 'pando-mysql' existe"
else
    print_warning "Instancia Cloud SQL 'pando-mysql' no existe"
    echo ""
    read -p "¿Crear instancia de Cloud SQL? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Creando instancia de Cloud SQL..."
        gcloud sql instances create pando-mysql \
            --database-version=MYSQL_8_0 \
            --tier=db-f1-micro \
            --region=$REGION \
            --storage-type=SSD \
            --storage-size=10GB \
            --backup-start-time=03:00 \
            --enable-bin-log \
            --maintenance-window-day=SUN \
            --maintenance-window-hour=04 \
            --no-assign-ip \
            --network=default
        
        print_status "Creando base de datos..."
        gcloud sql databases create pando_db --instance=pando-mysql
        
        print_success "Cloud SQL configurado"
        print_warning "IMPORTANTE: Configura la contraseña de root:"
        echo "gcloud sql users set-password root --host=% --instance=pando-mysql --password=TU_CONTRASEÑA"
    fi
fi

# Verificar secretos (si existen)
print_status "Verificando secretos..."
SECRETS=("db-password" "gmail-user" "gmail-pass" "session-secret")
for secret in "${SECRETS[@]}"; do
    if gcloud secrets describe $secret > /dev/null 2>&1; then
        print_success "Secreto '$secret' existe"
    else
        print_warning "Secreto '$secret' no existe"
        print_status "Para crear: gcloud secrets create $secret --data-file=-"
    fi
done

# Verificar servicio de Cloud Run
print_status "Verificando servicio de Cloud Run..."
if gcloud run services describe $SERVICE_NAME --region=$REGION > /dev/null 2>&1; then
    print_success "Servicio Cloud Run '$SERVICE_NAME' existe"
    
    # Mostrar URL del servicio
    SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)")
    print_success "URL del servicio: $SERVICE_URL"
else
    print_warning "Servicio Cloud Run '$SERVICE_NAME' no existe"
    print_status "Se creará automáticamente en el primer deployment"
fi

echo ""
print_success "✅ Configuración completada!"
echo ""
print_status "Próximos pasos:"
echo "1. Configurar secretos si no existen:"
echo "   - gcloud secrets create db-password --data-file=-"
echo "   - gcloud secrets create gmail-user --data-file=-"
echo "   - gcloud secrets create gmail-pass --data-file=-"
echo "   - gcloud secrets create session-secret --data-file=-"
echo ""
echo "2. Actualizar secretos de GitHub Actions:"
echo "   - GCP_SA_KEY: Clave JSON del service account"
echo ""
echo "3. Hacer push al repositorio para activar el deployment"
echo ""
print_status "Información del proyecto:"
echo "  Proyecto ID: $NEW_PROJECT_ID"
echo "  Proyecto Number: $NEW_PROJECT_NUMBER"
echo "  Región: $REGION"
echo "  Service Account: $NEW_PROJECT_NUMBER-compute@developer.gserviceaccount.com"
echo "  Artifact Registry: europe-west1-docker.pkg.dev/$NEW_PROJECT_ID/cloud-run-source-deploy"
echo ""
