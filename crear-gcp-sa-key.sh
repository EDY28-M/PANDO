#!/bin/bash

# crear-gcp-sa-key.sh - Script para crear la clave del Service Account para GitHub
# PANDO Project - Generación de GCP_SA_KEY

set -e

echo "🔑 PANDO - Creación de Service Account Key para GitHub"
echo "===================================================="

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
SERVICE_ACCOUNT="565241049736-compute@developer.gserviceaccount.com"
KEY_FILE="gcp-sa-key.json"

print_status "Proyecto: $PROJECT_ID"
print_status "Service Account: $SERVICE_ACCOUNT"

# Verificar que gcloud esté configurado
CURRENT_PROJECT=$(gcloud config get-value project 2>/dev/null || echo "")
if [ "$CURRENT_PROJECT" != "$PROJECT_ID" ]; then
    print_status "Configurando proyecto en gcloud..."
    gcloud config set project $PROJECT_ID
    print_success "Proyecto configurado: $PROJECT_ID"
fi

# Verificar que el service account existe
print_status "Verificando service account..."
if gcloud iam service-accounts describe $SERVICE_ACCOUNT > /dev/null 2>&1; then
    print_success "Service account existe: $SERVICE_ACCOUNT"
else
    print_error "Service account no existe: $SERVICE_ACCOUNT"
    print_status "El service account se crea automáticamente con el proyecto"
    print_status "Verifica que el PROJECT_ID sea correcto"
    exit 1
fi

# Crear la clave del service account
print_status "Creando clave del service account..."
if gcloud iam service-accounts keys create $KEY_FILE \
    --iam-account=$SERVICE_ACCOUNT; then
    print_success "Clave creada exitosamente: $KEY_FILE"
else
    print_error "Error al crear la clave del service account"
    exit 1
fi

# Mostrar el contenido de la clave
echo ""
print_success "🎉 Clave del Service Account creada!"
echo ""
print_warning "IMPORTANTE: Copia el siguiente contenido JSON completo:"
print_warning "Este es el valor que debes usar para GCP_SA_KEY en GitHub Secrets"
echo ""
echo "============== INICIO DEL JSON =============="
cat $KEY_FILE
echo ""
echo "=============== FIN DEL JSON ================"
echo ""

print_status "Pasos siguientes:"
echo "1. Copia TODO el contenido JSON de arriba (desde { hasta })"
echo "2. Ve a tu repositorio GitHub → Settings → Secrets and variables → Actions"
echo "3. Busca 'GCP_SA_KEY' o crea un nuevo secret con ese nombre"
echo "4. Pega el JSON completo como valor del secret"
echo "5. Guarda el secret"
echo ""

print_warning "SEGURIDAD:"
echo "- El archivo $KEY_FILE contiene credenciales sensibles"
echo "- NO lo subas a Git ni lo compartas"
echo "- Elimínalo después de copiarlo a GitHub"
echo ""

read -p "¿Eliminar el archivo de clave ahora? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    rm -f $KEY_FILE
    print_success "Archivo de clave eliminado por seguridad"
else
    print_warning "Recuerda eliminar $KEY_FILE manualmente después de usarlo"
fi

echo ""
print_success "✅ Proceso completado!"
print_status "Ahora puedes hacer push a tu repositorio para activar el deployment"
