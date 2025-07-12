#!/usr/bin/env python3
"""
Script para verificar la conexión a Cloud SQL
"""

import os
import sys
import subprocess
import json 

# Colores para la salida
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def print_colored(text, color):
    print(f"{color}{text}{Colors.END}")

def run_command(command):
    """Ejecuta un comando y retorna la salida"""
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        return result.stdout.strip(), result.returncode
    except Exception as e:
        return str(e), 1

def main():
    print_colored("🔍 Verificación de conexión a Cloud SQL", Colors.BLUE)
    print("=" * 50)
    
    # Configuración
    project_id = "luminous-style-465017-v6"
    instance_name = "pando-mysql"
    db_name = "pando_db"
    cloud_sql_ip = "34.28.91.171"
    region = "europe-west1"
    service_name = "pando"
    
    print(f"\n📋 Configuración:")
    print(f"  Proyecto: {project_id}")
    print(f"  Instancia: {instance_name}")
    print(f"  Base de datos: {db_name}")
    print(f"  IP Cloud SQL: {cloud_sql_ip}")
    
    # 1. Verificar gcloud
    print_colored("\n1. Verificando gcloud CLI...", Colors.YELLOW)
    output, code = run_command("gcloud --version")
    if code == 0:
        print_colored("✅ gcloud CLI instalado", Colors.GREEN)
    else:
        print_colored("❌ gcloud CLI no encontrado", Colors.RED)
        return
    
    # 2. Configurar proyecto
    print_colored("\n2. Configurando proyecto...", Colors.YELLOW)
    run_command(f"gcloud config set project {project_id}")
    print_colored("✅ Proyecto configurado", Colors.GREEN)
    
    # 3. Obtener IP pública
    print_colored("\n3. Obteniendo tu IP pública...", Colors.YELLOW)
    ip_output, _ = run_command("curl -s https://api.ipify.org")
    if ip_output:
        print(f"Tu IP pública: {ip_output}")
        
        # Verificar si está autorizada
        auth_ips, _ = run_command(f'gcloud sql instances describe {instance_name} --project={project_id} --format="value(settings.ipConfiguration.authorizedNetworks[].value)"')
        if ip_output in auth_ips:
            print_colored("✅ Tu IP está autorizada", Colors.GREEN)
        else:
            print_colored("❌ Tu IP NO está autorizada", Colors.RED)
            print_colored(f"\nPara autorizar tu IP, ejecuta:", Colors.YELLOW)
            print(f"gcloud sql instances patch {instance_name} --authorized-networks={ip_output} --project={project_id}")
    
    # 4. Verificar secreto de contraseña
    print_colored("\n4. Verificando secreto db-password...", Colors.YELLOW)
    secret_check, code = run_command(f"gcloud secrets describe db-password --project={project_id}")
    if code == 0:
        print_colored("✅ Secreto db-password existe", Colors.GREEN)
        
        # Obtener contraseña
        password, _ = run_command(f"gcloud secrets versions access latest --secret=db-password --project={project_id}")
        if password:
            print_colored("✅ Contraseña obtenida", Colors.GREEN)
            
            # Crear archivo temporal con credenciales
            print_colored("\n5. Creando archivo de configuración temporal...", Colors.YELLOW)
            config_content = f"""
# Configuración para prueba local
DB_HOST={cloud_sql_ip}
DB_PORT=3306
DB_USER=root
DB_PASSWORD={password}
DB_NAME={db_name}
CLOUD_SQL_CONNECTION_NAME={project_id}:us-central1:{instance_name}
CLOUD_SQL_PUBLIC_IP={cloud_sql_ip}
"""
            
            env_file = os.path.join(os.path.dirname(__file__), '..', '.env.test')
            with open(env_file, 'w') as f:
                f.write(config_content)
            
            print_colored(f"✅ Archivo creado: {env_file}", Colors.GREEN)
            print_colored("\nPara probar la conexión localmente:", Colors.YELLOW)
            print("1. cd PANDO")
            print("2. cp .env.test .env")
            print("3. node scripts/test-cloud-sql-connection.js")
    else:
        print_colored("❌ Secreto db-password NO existe", Colors.RED)
    
    # 5. Verificar servicio Cloud Run
    print_colored("\n6. Verificando servicio Cloud Run...", Colors.YELLOW)
    service_info, code = run_command(f"gcloud run services describe {service_name} --region={region} --project={project_id} --format=json")
    if code == 0:
        print_colored("✅ Servicio encontrado", Colors.GREEN)
        try:
            service_data = json.loads(service_info)
            service_url = service_data.get('status', {}).get('url', '')
            if service_url:
                print(f"URL del servicio: {service_url}")
                
                # Probar endpoints
                print_colored("\n7. Probando endpoints...", Colors.YELLOW)
                
                # Health check
                health_check, _ = run_command(f"curl -s -o /dev/null -w '%{{http_code}}' {service_url}/health")
                if health_check == "200":
                    print_colored("✅ /health respondiendo correctamente", Colors.GREEN)
                else:
                    print_colored(f"❌ /health respondió con código: {health_check}", Colors.RED)
                
                # Database status
                db_status, _ = run_command(f"curl -s {service_url}/api/database/status")
                print(f"Estado de base de datos: {db_status}")
        except:
            pass
    else:
        print_colored("❌ Servicio no encontrado", Colors.RED)
    
    # 6. Ver logs recientes
    print_colored("\n8. Logs recientes del servicio:", Colors.YELLOW)
    logs, _ = run_command(f"gcloud run services logs read {service_name} --region={region} --project={project_id} --limit=10 --format='value(textPayload)'")
    if logs:
        print(logs)
    
    # Resumen
    print_colored("\n📊 RESUMEN:", Colors.BLUE)
    print("=" * 50)
    print_colored("\nPasos para solucionar problemas:", Colors.YELLOW)
    print("1. Asegúrate de que tu IP esté autorizada")
    print("2. Verifica que el secreto db-password tenga la contraseña correcta")
    print("3. Ejecuta el script fix-cloud-sql-connection.sh para aplicar cambios")
    print("4. Redespliega el servicio si es necesario:")
    print(f"   gcloud run deploy {service_name} --source . --region={region} --project={project_id}")
    
    print_colored("\n✅ Verificación completada", Colors.GREEN)

if __name__ == "__main__":
    main()
