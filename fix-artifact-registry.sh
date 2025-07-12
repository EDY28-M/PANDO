#!/bin/bash

# fix-artifact-registry.sh - Script para solucionar problemas de Artifact Registry
# PANDO Project - Configuración específica para permisos y repositorio

set -e

echo "🔧 PANDO - Solucionando Artifact Registry"
echo "========================================="

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

# Variables del proyecto
PROJECT_ID="luminous-style-465017-v6"
REGION="europe-west1"
REPOSITORY="cloud-run-source-deploy"

print_status "Configurando Artifact Registry para proyecto: $PROJECT_ID"

# Verificar que gcloud esté configurado
CURRENT_PROJECT=$(gcloud config get-value project 2>/dev/null || echo "")
if [ "$CURRENT_PROJECT" != "$PROJECT_ID" ]; then
    print_status "Configurando proyecto en gcloud..."
    gcloud config set project $PROJECT_ID
    print_success "Proyecto configurado: $PROJECT_ID"
fi

# Habilitar APIs necesarias
print_status "Habilitando APIs necesarias..."
gcloud services enable artifactregistry.googleapis.com --quiet
gcloud services enable cloudbuild.googleapis.com --quiet
gcloud services enable run.googleapis.com --quiet
print_success "APIs habilitadas"

# Verificar si el repositorio existe
print_status "Verificando repositorio de Artifact Registry..."
if gcloud artifacts repositories describe $REPOSITORY --location=$REGION > /dev/null 2>&1; then
    print_success "Repositorio '$REPOSITORY' existe"
else
    print_warning "Repositorio '$REPOSITORY' no existe"
    print_status "Creando repositorio..."
    
    gcloud artifacts repositories create $REPOSITORY \
        --repository-format=docker \
        --location=$REGION \
        --description="Repository for PANDO Cloud Run deployments" \
        --quiet
    
    if [ $? -eq 0 ]; then
        print_success "Repositorio '$REPOSITORY' creado exitosamente"
    else
        print_error "Error al crear el repositorio"
        exit 1
    fi
fi

# Configurar autenticación de Docker
print_status "Configurando autenticación de Docker..."
gcloud auth configure-docker $REGION-docker.pkg.dev --quiet
print_success "Docker configurado para Artifact Registry"

# Verificar permisos del service account
print_status "Verificando permisos del service account..."
SERVICE_ACCOUNT="565241049736-compute@developer.gserviceaccount.com"

# Otorgar permisos necesarios al service account
print_status "Otorgando permisos al service account..."

# Permisos para Artifact Registry
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/artifactregistry.writer" \
    --quiet

# Permisos para Cloud Run
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/run.developer" \
    --quiet

# Permisos para Cloud Build
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/cloudbuild.builds.builder" \
    --quiet

print_success "Permisos otorgados al service account"

# Verificar que el usuario actual tenga permisos
print_status "Verificando permisos del usuario actual..."
CURRENT_USER=$(gcloud auth list --filter=status:ACTIVE --format="value(account)" | head -n1)

if [ ! -z "$CURRENT_USER" ]; then
    print_status "Usuario actual: $CURRENT_USER"
    
    # Otorgar permisos al usuario actual
    gcloud projects add-iam-policy-binding $PROJECT_ID \
        --member="user:$CURRENT_USER" \
        --role="roles/artifactregistry.writer" \
        --quiet
    
    gcloud projects add-iam-policy-binding $PROJECT_ID \
        --member="user:$CURRENT_USER" \
        --role="roles/run.developer" \
        --quiet
    
    print_success "Permisos otorgados al usuario: $CURRENT_USER"
fi

# Probar la configuración
print_status "Probando configuración..."

# Test 1: Verificar que podemos listar repositorios
if gcloud artifacts repositories list --location=$REGION > /dev/null 2>&1; then
    print_success "✅ Puede listar repositorios"
else
    print_error "❌ No puede listar repositorios"
fi

# Test 2: Verificar autenticación de Docker
if docker pull hello-world > /dev/null 2>&1; then
    print_status "Probando push de imagen de prueba..."
    
    # Tag de prueba
    docker tag hello-world $REGION-docker.pkg.dev/$PROJECT_ID/$REPOSITORY/test:latest
    
    # Intentar push
    if docker push $REGION-docker.pkg.dev/$PROJECT_ID/$REPOSITORY/test:latest > /dev/null 2>&1; then
        print_success "✅ Push de prueba exitoso"
        
        # Limpiar imagen de prueba
        gcloud artifacts docker images delete $REGION-docker.pkg.dev/$PROJECT_ID/$REPOSITORY/test:latest --quiet > /dev/null 2>&1 || true
    else
        print_warning "❌ Push de prueba falló - puede necesitar más permisos"
    fi
else
    print_warning "No se pudo descargar imagen de prueba"
fi

echo ""
print_success "🎉 Configuración de Artifact Registry completada!"
echo ""
print_status "Información del repositorio:"
echo "  Proyecto: $PROJECT_ID"
echo "  Región: $REGION"
echo "  Repositorio: $REPOSITORY"
echo "  URL completa: $REGION-docker.pkg.dev/$PROJECT_ID/$REPOSITORY"
echo ""
print_status "Comandos útiles:"
echo "  Listar repositorios: gcloud artifacts repositories list --location=$REGION"
echo "  Listar imágenes: gcloud artifacts docker images list $REGION-docker.pkg.dev/$PROJECT_ID/$REPOSITORY"
echo "  Configurar Docker: gcloud auth configure-docker $REGION-docker.pkg.dev"
echo ""
print_warning "Si aún tienes problemas, verifica que:"
echo "1. Tienes permisos de 'Artifact Registry Admin' en el proyecto"
echo "2. El service account de GitHub Actions tiene las credenciales correctas"
echo "3. La variable GCP_SA_KEY en GitHub está actualizada"
