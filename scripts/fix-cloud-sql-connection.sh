#!/bin/bash

# Script para verificar y corregir la conexión de Cloud SQL en Cloud Run
# Este script ayuda a diagnosticar y solucionar problemas de conexión

echo "🔧 Script de diagnóstico y corrección de Cloud SQL"
echo "=================================================="

# Variables de configuración
PROJECT_ID="luminous-style-465017-v6"
REGION="europe-west1"
SERVICE_NAME="pando"
CLOUD_SQL_INSTANCE="luminous-style-465017-v6:us-central1:pando-mysql"
SERVICE_ACCOUNT="p565241049736-mu9vt6@gcp-sa-cloud-sql.iam.gserviceaccount.com"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "\n${YELLOW}1. Verificando configuración actual...${NC}"
echo "Proyecto: $PROJECT_ID"
echo "Región Cloud Run: $REGION"
echo "Instancia Cloud SQL: $CLOUD_SQL_INSTANCE"
echo "Service Account: $SERVICE_ACCOUNT"

# Verificar si gcloud está instalado
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ gcloud CLI no está instalado. Por favor instálalo primero.${NC}"
    exit 1
fi

# Configurar proyecto
echo -e "\n${YELLOW}2. Configurando proyecto...${NC}"
gcloud config set project $PROJECT_ID

# Verificar permisos del Service Account
echo -e "\n${YELLOW}3. Verificando permisos del Service Account...${NC}"
echo "Service Account: $SERVICE_ACCOUNT"

# Verificar si el service account tiene los permisos necesarios
echo "Verificando rol Cloud SQL Client..."
if gcloud projects get-iam-policy $PROJECT_ID --flatten="bindings[].members" --format='table(bindings.role)' --filter="bindings.members:$SERVICE_ACCOUNT" | grep -q "roles/cloudsql.client"; then
    echo -e "${GREEN}✅ Service Account tiene rol Cloud SQL Client${NC}"
else
    echo -e "${RED}❌ Service Account NO tiene rol Cloud SQL Client${NC}"
    echo "Agregando rol..."
    gcloud projects add-iam-policy-binding $PROJECT_ID \
        --member="serviceAccount:$SERVICE_ACCOUNT" \
        --role="roles/cloudsql.client"
fi

# Verificar secretos de Cloud Run
echo -e "\n${YELLOW}4. Verificando secretos en Cloud Run...${NC}"
REQUIRED_SECRETS=("db-password" "gmail-user" "gmail-pass" "session-secret")

for secret in "${REQUIRED_SECRETS[@]}"; do
    if gcloud secrets describe $secret --project=$PROJECT_ID &> /dev/null; then
        echo -e "${GREEN}✅ Secreto '$secret' existe${NC}"
    else
        echo -e "${RED}❌ Secreto '$secret' NO existe${NC}"
        echo "Por favor crea el secreto con:"
        echo "gcloud secrets create $secret --data-file=- --project=$PROJECT_ID"
    fi
done

# Verificar la instancia de Cloud SQL
echo -e "\n${YELLOW}5. Verificando instancia de Cloud SQL...${NC}"
INSTANCE_NAME="pando-mysql"
INSTANCE_REGION="us-central1"

if gcloud sql instances describe $INSTANCE_NAME --project=$PROJECT_ID &> /dev/null; then
    echo -e "${GREEN}✅ Instancia Cloud SQL '$INSTANCE_NAME' existe${NC}"
    
    # Obtener IP pública
    PUBLIC_IP=$(gcloud sql instances describe $INSTANCE_NAME --project=$PROJECT_ID --format="value(ipAddresses[0].ipAddress)")
    echo "IP Pública: $PUBLIC_IP"
    
    # Verificar si la base de datos existe
    echo "Verificando base de datos 'pando_db'..."
    if gcloud sql databases describe pando_db --instance=$INSTANCE_NAME --project=$PROJECT_ID &> /dev/null; then
        echo -e "${GREEN}✅ Base de datos 'pando_db' existe${NC}"
    else
        echo -e "${RED}❌ Base de datos 'pando_db' NO existe${NC}"
        echo "Creando base de datos..."
        gcloud sql databases create pando_db --instance=$INSTANCE_NAME --project=$PROJECT_ID
    fi
else
    echo -e "${RED}❌ Instancia Cloud SQL NO encontrada${NC}"
fi

# Actualizar el servicio de Cloud Run
echo -e "\n${YELLOW}6. Actualizando configuración de Cloud Run...${NC}"
echo "¿Deseas actualizar el servicio Cloud Run con la nueva configuración? (y/n)"
read -r response

if [[ "$response" == "y" ]]; then
    echo "Aplicando configuración..."
    
    # Aplicar el archivo cloudrun.yaml
    gcloud run services replace cloudrun.yaml --region=$REGION --project=$PROJECT_ID
    
    echo -e "${GREEN}✅ Configuración aplicada${NC}"
    
    # Obtener URL del servicio
    SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --project=$PROJECT_ID --format="value(status.url)")
    echo -e "\n${GREEN}URL del servicio: $SERVICE_URL${NC}"
else
    echo "Actualización cancelada."
fi

# Mostrar comandos útiles
echo -e "\n${YELLOW}7. Comandos útiles para debugging:${NC}"
echo "# Ver logs del servicio:"
echo "gcloud run services logs read $SERVICE_NAME --region=$REGION --project=$PROJECT_ID --limit=50"
echo ""
echo "# Describir el servicio:"
echo "gcloud run services describe $SERVICE_NAME --region=$REGION --project=$PROJECT_ID"
echo ""
echo "# Conectarse a Cloud SQL desde Cloud Shell:"
echo "gcloud sql connect $INSTANCE_NAME --user=root --project=$PROJECT_ID"
echo ""
echo "# Ver revisiones del servicio:"
echo "gcloud run revisions list --service=$SERVICE_NAME --region=$REGION --project=$PROJECT_ID"

echo -e "\n${GREEN}✅ Script completado${NC}"
