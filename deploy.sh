#!/bin/bash

# Script de despliegue para Google Cloud Platform
# Autor: Kera AI Cuentas
# Fecha: $(date)

echo "🚀 Iniciando despliegue en Google Cloud Platform..."

# Verificar que gcloud CLI esté instalado
if ! command -v gcloud &> /dev/null; then
    echo "❌ Error: Google Cloud CLI no está instalado"
    echo "Instala desde: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Verificar autenticación
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "🔐 Iniciando autenticación con Google Cloud..."
    gcloud auth login
fi

# Configurar proyecto (reemplaza con tu PROJECT_ID)
PROJECT_ID="tu-project-id"
echo "📋 Configurando proyecto: $PROJECT_ID"
gcloud config set project $PROJECT_ID

# Habilitar APIs necesarias
echo "🔧 Habilitando APIs necesarias..."
gcloud services enable appengine.googleapis.com
gcloud services enable cloudbuild.googleapis.com

# Construir y desplegar
echo "🏗️ Construyendo y desplegando aplicación..."
gcloud app deploy --quiet

# Mostrar URL de la aplicación
echo "✅ Despliegue completado!"
echo "🌐 Tu aplicación está disponible en:"
gcloud app browse --no-launch-browser

echo "📊 Para ver logs: gcloud app logs tail -s default"
echo "🔧 Para gestionar: https://console.cloud.google.com/appengine" 