#!/bin/bash

# deploy-gcp.sh - Script de deployment automatizado para Google Cloud Platform
# PANDO Project - Google Cloud SQL Integration

set -e  # Salir si hay algún error

echo "🚀 PANDO - Deployment a Google Cloud Platform"
echo "=============================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes con colores
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

# Verificar que gcloud esté instalado
if ! command -v gcloud &> /dev/null; then
    print_error "gcloud CLI no está instalado"
    print_status "Instala Google Cloud CLI desde: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Verificar autenticación
print_status "Verificando autenticación con Google Cloud..."
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | head -n1 > /dev/null; then
    print_error "No estás autenticado con Google Cloud"
    print_status "Ejecuta: gcloud auth login"
    exit 1
fi

CURRENT_USER=$(gcloud auth list --filter=status:ACTIVE --format="value(account)" | head -n1)
print_success "Autenticado como: $CURRENT_USER"

# Obtener proyecto actual
CURRENT_PROJECT=$(gcloud config get-value project 2>/dev/null || echo "")
if [ -z "$CURRENT_PROJECT" ]; then
    print_error "No hay un proyecto configurado"
    print_status "Ejecuta: gcloud config set project TU_PROYECTO_ID"
    exit 1
fi

print_success "Proyecto actual: $CURRENT_PROJECT"

# Verificar que App Engine esté habilitado
print_status "Verificando App Engine..."
if ! gcloud app describe > /dev/null 2>&1; then
    print_warning "App Engine no está inicializado"
    print_status "Inicializando App Engine..."
    gcloud app create --region=us-central
    print_success "App Engine inicializado"
fi

# Verificar Cloud SQL API
print_status "Verificando APIs necesarias..."
gcloud services enable sqladmin.googleapis.com --quiet
gcloud services enable appengine.googleapis.com --quiet
print_success "APIs habilitadas"

# Función para crear instancia de Cloud SQL
create_cloud_sql() {
    local INSTANCE_NAME="pando-mysql"
    local DB_NAME="pando_db"
    local REGION="us-central1"
    
    print_status "Verificando instancia de Cloud SQL..."
    
    if gcloud sql instances describe $INSTANCE_NAME > /dev/null 2>&1; then
        print_success "Instancia Cloud SQL '$INSTANCE_NAME' ya existe"
    else
        print_status "Creando instancia de Cloud SQL..."
        gcloud sql instances create $INSTANCE_NAME \
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
        
        print_success "Instancia Cloud SQL creada: $INSTANCE_NAME"
    fi
    
    # Verificar base de datos
    print_status "Verificando base de datos..."
    if gcloud sql databases describe $DB_NAME --instance=$INSTANCE_NAME > /dev/null 2>&1; then
        print_success "Base de datos '$DB_NAME' ya existe"
    else
        print_status "Creando base de datos..."
        gcloud sql databases create $DB_NAME --instance=$INSTANCE_NAME
        print_success "Base de datos '$DB_NAME' creada"
    fi
    
    # Mostrar información de conexión
    CONNECTION_NAME="$CURRENT_PROJECT:$REGION:$INSTANCE_NAME"
    print_success "Nombre de conexión: $CONNECTION_NAME"
    
    echo ""
    print_warning "IMPORTANTE: Actualiza app.yaml con estos valores:"
    echo "  GOOGLE_CLOUD_PROJECT: \"$CURRENT_PROJECT\""
    echo "  CLOUD_SQL_CONNECTION_NAME: \"$CONNECTION_NAME\""
    echo "  cloud_sql_instances: \"$CONNECTION_NAME\""
    echo ""
}

# Función para verificar app.yaml
check_app_yaml() {
    print_status "Verificando configuración de app.yaml..."
    
    if [ ! -f "app.yaml" ]; then
        print_error "app.yaml no encontrado"
        exit 1
    fi
    
    # Verificar variables críticas
    if ! grep -q "CLOUD_SQL_CONNECTION_NAME" app.yaml; then
        print_warning "CLOUD_SQL_CONNECTION_NAME no configurado en app.yaml"
    fi
    
    if ! grep -q "cloud_sql_instances" app.yaml; then
        print_warning "cloud_sql_instances no configurado en app.yaml"
    fi
    
    print_success "app.yaml verificado"
}

# Función para ejecutar tests pre-deployment
run_tests() {
    print_status "Ejecutando tests pre-deployment..."
    
    # Test de configuración
    if npm run test-config > /dev/null 2>&1; then
        print_success "Configuración de email: OK"
    else
        print_warning "Configuración de email: Revisar"
    fi
    
    # Test de dependencias
    if npm list > /dev/null 2>&1; then
        print_success "Dependencias: OK"
    else
        print_warning "Dependencias: Algunos paquetes pueden tener warnings"
    fi
    
    print_success "Tests completados"
}

# Función para hacer deployment
deploy_app() {
    print_status "Iniciando deployment..."
    
    # Backup de la configuración actual
    if [ -f ".env" ]; then
        cp .env .env.backup
        print_status "Backup de .env creado"
    fi
    
    # Deployment
    print_status "Desplegando aplicación..."
    gcloud app deploy --quiet
    
    if [ $? -eq 0 ]; then
        print_success "¡Deployment completado exitosamente!"
        
        # Obtener URL de la aplicación
        APP_URL=$(gcloud app describe --format="value(defaultHostname)" 2>/dev/null)
        if [ ! -z "$APP_URL" ]; then
            print_success "Aplicación disponible en: https://$APP_URL"
            print_success "Panel de administración: https://$APP_URL/admin.html"
        fi
        
        # Mostrar comandos útiles
        echo ""
        print_status "Comandos útiles:"
        echo "  Ver logs:      gcloud app logs tail -s default"
        echo "  Abrir app:     gcloud app browse"
        echo "  Ver versiones: gcloud app versions list"
        echo "  Cloud SQL:     gcloud sql connect pando-mysql --user=root"
        
    else
        print_error "Error durante el deployment"
        exit 1
    fi
}

# Función principal
main() {
    print_status "Iniciando proceso de deployment..."
    
    # Verificar argumentos
    CREATE_SQL=false
    SKIP_TESTS=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --create-sql)
                CREATE_SQL=true
                shift
                ;;
            --skip-tests)
                SKIP_TESTS=true
                shift
                ;;
            --help|-h)
                echo "Uso: $0 [opciones]"
                echo ""
                echo "Opciones:"
                echo "  --create-sql    Crear instancia de Cloud SQL si no existe"
                echo "  --skip-tests    Omitir tests pre-deployment"
                echo "  --help, -h      Mostrar esta ayuda"
                exit 0
                ;;
            *)
                print_error "Opción desconocida: $1"
                exit 1
                ;;
        esac
    done
    
    # Verificar directorio del proyecto
    if [ ! -f "package.json" ] || [ ! -f "server.js" ]; then
        print_error "Ejecuta este script desde el directorio raíz del proyecto PANDO"
        exit 1
    fi
    
    # Instalar dependencias
    print_status "Instalando dependencias..."
    npm install --production
    print_success "Dependencias instaladas"
    
    # Crear Cloud SQL si se solicita
    if [ "$CREATE_SQL" = true ]; then
        create_cloud_sql
        echo ""
        print_warning "Cloud SQL creado. Actualiza app.yaml antes de continuar."
        read -p "¿Continuar con el deployment? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_status "Deployment cancelado"
            exit 0
        fi
    fi
    
    # Verificar configuración
    check_app_yaml
    
    # Ejecutar tests
    if [ "$SKIP_TESTS" = false ]; then
        run_tests
    fi
    
    # Confirmar deployment
    echo ""
    print_warning "¿Proceder con el deployment a producción?"
    print_status "Proyecto: $CURRENT_PROJECT"
    print_status "Usuario: $CURRENT_USER"
    echo ""
    read -p "Confirmar deployment (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Deployment cancelado"
        exit 0
    fi
    
    # Ejecutar deployment
    deploy_app
    
    print_success "¡Proceso completado!"
}

# Ejecutar función principal
main "$@"
