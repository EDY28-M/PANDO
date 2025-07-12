#!/bin/bash

# Script para verificar la conexión a Cloud SQL
echo "🔍 Verificación de conexión a Cloud SQL"
echo "======================================="

# Variables
PROJECT_ID="luminous-style-465017-v6"
INSTANCE_NAME="pando-mysql"
DB_NAME="pando_db"
CLOUD_SQL_IP="34.28.91.171"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "\n${BLUE}📋 Información de la instancia:${NC}"
echo "Proyecto: $PROJECT_ID"
echo "Instancia: $INSTANCE_NAME"
echo "Base de datos: $DB_NAME"
echo "IP Pública: $CLOUD_SQL_IP"

# 1. Verificar que gcloud esté configurado
echo -e "\n${YELLOW}1. Verificando configuración de gcloud...${NC}"
CURRENT_PROJECT=$(gcloud config get-value project 2>/dev/null)
if [ "$CURRENT_PROJECT" != "$PROJECT_ID" ]; then
    echo "Configurando proyecto..."
    gcloud config set project $PROJECT_ID
fi

# 2. Obtener información de la instancia
echo -e "\n${YELLOW}2. Obteniendo información de Cloud SQL...${NC}"
if gcloud sql instances describe $INSTANCE_NAME --project=$PROJECT_ID &> /dev/null; then
    echo -e "${GREEN}✅ Instancia encontrada${NC}"
    
    # Obtener IPs autorizadas
    echo -e "\n${BLUE}IPs autorizadas:${NC}"
    gcloud sql instances describe $INSTANCE_NAME --project=$PROJECT_ID --format="value(settings.ipConfiguration.authorizedNetworks[].value)" | while read ip; do
        echo "  - $ip"
    done
    
    # Estado de la instancia
    STATE=$(gcloud sql instances describe $INSTANCE_NAME --project=$PROJECT_ID --format="value(state)")
    echo -e "\nEstado de la instancia: ${GREEN}$STATE${NC}"
else
    echo -e "${RED}❌ No se pudo encontrar la instancia${NC}"
    exit 1
fi

# 3. Obtener tu IP pública
echo -e "\n${YELLOW}3. Obteniendo tu IP pública...${NC}"
MY_IP=$(curl -s https://api.ipify.org)
echo "Tu IP pública es: $MY_IP"

# 4. Verificar si tu IP está autorizada
echo -e "\n${YELLOW}4. Verificando autorización de IP...${NC}"
if gcloud sql instances describe $INSTANCE_NAME --project=$PROJECT_ID --format="value(settings.ipConfiguration.authorizedNetworks[].value)" | grep -q "$MY_IP"; then
    echo -e "${GREEN}✅ Tu IP está autorizada${NC}"
else
    echo -e "${RED}❌ Tu IP NO está autorizada${NC}"
    echo -e "\n${YELLOW}Para autorizar tu IP, ejecuta:${NC}"
    echo "gcloud sql instances patch $INSTANCE_NAME --authorized-networks=$MY_IP --project=$PROJECT_ID"
    echo -e "\n${YELLOW}O para autorizar temporalmente todas las IPs (NO recomendado para producción):${NC}"
    echo "gcloud sql instances patch $INSTANCE_NAME --authorized-networks=0.0.0.0/0 --project=$PROJECT_ID"
fi

# 5. Verificar secretos
echo -e "\n${YELLOW}5. Verificando secretos en Google Cloud...${NC}"
if gcloud secrets describe db-password --project=$PROJECT_ID &> /dev/null; then
    echo -e "${GREEN}✅ Secreto 'db-password' existe${NC}"
    
    # Obtener el valor del secreto (solo para pruebas locales)
    echo -e "\n${YELLOW}¿Quieres ver el valor del secreto db-password? (y/n)${NC}"
    read -r response
    if [[ "$response" == "y" ]]; then
        DB_PASS=$(gcloud secrets versions access latest --secret=db-password --project=$PROJECT_ID 2>/dev/null)
        if [ -n "$DB_PASS" ]; then
            echo "Contraseña obtenida (ocultada por seguridad)"
            
            # Probar conexión con mysql client si está instalado
            if command -v mysql &> /dev/null; then
                echo -e "\n${YELLOW}6. Probando conexión directa con mysql...${NC}"
                echo "Ejecutando: mysql -h $CLOUD_SQL_IP -u root -p'***' $DB_NAME -e 'SELECT 1'"
                if mysql -h "$CLOUD_SQL_IP" -u root -p"$DB_PASS" "$DB_NAME" -e "SELECT 1" &> /dev/null; then
                    echo -e "${GREEN}✅ ¡Conexión exitosa a la base de datos!${NC}"
                    
                    # Mostrar tablas
                    echo -e "\n${BLUE}Tablas en la base de datos:${NC}"
                    mysql -h "$CLOUD_SQL_IP" -u root -p"$DB_PASS" "$DB_NAME" -e "SHOW TABLES"
                else
                    echo -e "${RED}❌ No se pudo conectar a la base de datos${NC}"
                fi
            else
                echo -e "${YELLOW}⚠️ Cliente mysql no instalado. No se puede probar la conexión directa.${NC}"
            fi
        fi
    fi
else
    echo -e "${RED}❌ Secreto 'db-password' NO existe${NC}"
fi

# 6. Mostrar comando para conectarse desde Cloud Shell
echo -e "\n${YELLOW}7. Para conectarte desde Google Cloud Shell:${NC}"
echo "gcloud sql connect $INSTANCE_NAME --user=root --project=$PROJECT_ID"

# 7. Verificar el servicio de Cloud Run
echo -e "\n${YELLOW}8. Verificando servicio Cloud Run...${NC}"
if gcloud run services describe pando --region=europe-west1 --project=$PROJECT_ID &> /dev/null; then
    echo -e "${GREEN}✅ Servicio 'pando' encontrado${NC}"
    
    SERVICE_URL=$(gcloud run services describe pando --region=europe-west1 --project=$PROJECT_ID --format="value(status.url)")
    echo "URL del servicio: $SERVICE_URL"
    
    # Probar endpoint de health
    echo -e "\n${YELLOW}Probando endpoint /health...${NC}"
    HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$SERVICE_URL/health")
    if [ "$HEALTH_RESPONSE" == "200" ]; then
        echo -e "${GREEN}✅ Servicio respondiendo correctamente${NC}"
        
        # Probar endpoint de estado de DB
        echo -e "\n${YELLOW}Probando endpoint /api/database/status...${NC}"
        DB_STATUS=$(curl -s "$SERVICE_URL/api/database/status")
        echo "Respuesta: $DB_STATUS"
    else
        echo -e "${RED}❌ Servicio no responde (código: $HEALTH_RESPONSE)${NC}"
    fi
else
    echo -e "${RED}❌ Servicio 'pando' no encontrado${NC}"
fi

# 8. Resumen y recomendaciones
echo -e "\n${BLUE}📊 RESUMEN Y RECOMENDACIONES:${NC}"
echo "=============================="

echo -e "\n${YELLOW}Para solucionar problemas de conexión:${NC}"
echo "1. Asegúrate de que tu IP esté autorizada en Cloud SQL"
echo "2. Verifica que la contraseña en el secreto 'db-password' sea correcta"
echo "3. Confirma que el usuario 'root' tenga permisos desde '%' (cualquier host)"
echo "4. Revisa los logs del servicio Cloud Run:"
echo "   gcloud run services logs read pando --region=europe-west1 --project=$PROJECT_ID --limit=50"

echo -e "\n${YELLOW}Para probar la conexión localmente:${NC}"
echo "1. Instala Node.js si no lo tienes"
echo "2. Desde el directorio PANDO, ejecuta:"
echo "   npm install"
echo "   node scripts/test-cloud-sql-connection.js"

echo -e "\n${GREEN}✅ Verificación completada${NC}"
