# 🔧 Solución: Conexión Cloud SQL en Cloud Run

## 📋 Resumen del Problema

Tu aplicación PANDO no puede conectarse a la base de datos Cloud SQL cuando está desplegada en Cloud Run. Los problemas identificados son:

1. **Desajuste de región**: Tu instancia Cloud SQL está en `us-central1` pero la configuración anterior apuntaba a `europe-west1`
2. **Service Account**: Necesitas usar el service account correcto con los permisos adecuados
3. **Configuración de conexión**: Cloud Run necesita la configuración correcta para conectarse a Cloud SQL

## ✅ Cambios Realizados

### 1. **cloudrun.yaml** - Actualizado
- ✅ Corregido el nombre de la instancia Cloud SQL: `luminous-style-465017-v6:us-central1:pando-mysql`
- ✅ Actualizado el service account: `p565241049736-mu9vt6@gcp-sa-cloud-sql.iam.gserviceaccount.com`
- ✅ Agregadas variables de entorno para conexión TCP como fallback:
  - `CLOUD_SQL_PUBLIC_IP`: 34.28.91.171
  - `DB_HOST`: 34.28.91.171
  - `DB_PORT`: 3306
- ✅ Agregadas variables K_SERVICE y K_REVISION para detectar Cloud Run

### 2. **config/gcp-database.js** - Mejorado
- ✅ Mejorada la detección de Cloud Run usando `K_SERVICE` o `K_REVISION`
- ✅ Implementado sistema de reintentos (3 intentos)
- ✅ Fallback automático de Unix Socket a TCP si falla la conexión
- ✅ Mejor manejo de errores con mensajes descriptivos

### 3. **scripts/fix-cloud-sql-connection.sh** - Nuevo
- ✅ Script de diagnóstico y corrección automática
- ✅ Verifica permisos del service account
- ✅ Verifica secretos necesarios
- ✅ Verifica la instancia Cloud SQL

## 🚀 Pasos para Solucionar

### Paso 1: Verificar Permisos del Service Account

```bash
# Asegúrate de que el service account tenga el rol Cloud SQL Client
gcloud projects add-iam-policy-binding luminous-style-465017-v6 \
    --member="serviceAccount:p565241049736-mu9vt6@gcp-sa-cloud-sql.iam.gserviceaccount.com" \
    --role="roles/cloudsql.client"
```

### Paso 2: Verificar/Crear Secretos

```bash
# Verificar que existan los secretos necesarios
gcloud secrets list --project=luminous-style-465017-v6

# Si falta algún secreto, créalo:
echo -n "tu-contraseña-mysql" | gcloud secrets create db-password --data-file=- --project=luminous-style-465017-v6
```

### Paso 3: Ejecutar el Script de Diagnóstico

```bash
# Dar permisos de ejecución
chmod +x PANDO/scripts/fix-cloud-sql-connection.sh

# Ejecutar el script
./PANDO/scripts/fix-cloud-sql-connection.sh
```

### Paso 4: Redesplegar la Aplicación

```bash
# Opción 1: Usar el archivo cloudrun.yaml
gcloud run services replace PANDO/cloudrun.yaml --region=europe-west1 --project=luminous-style-465017-v6

# Opción 2: Redesplegar desde el código fuente
gcloud run deploy pando \
    --source . \
    --region=europe-west1 \
    --project=luminous-style-465017-v6 \
    --add-cloudsql-instances=luminous-style-465017-v6:us-central1:pando-mysql \
    --service-account=p565241049736-mu9vt6@gcp-sa-cloud-sql.iam.gserviceaccount.com
```

### Paso 5: Verificar la Conexión

```bash
# Ver los logs del servicio
gcloud run services logs read pando --region=europe-west1 --project=luminous-style-465017-v6 --limit=50

# Buscar mensajes de conexión exitosa o error
```

## 🔍 Debugging

### Verificar el Estado del Servicio

```bash
# Describir el servicio
gcloud run services describe pando --region=europe-west1 --project=luminous-style-465017-v6

# Ver las revisiones
gcloud run revisions list --service=pando --region=europe-west1 --project=luminous-style-465017-v6
```

### Probar la Conexión a Cloud SQL

```bash
# Conectarse directamente a Cloud SQL desde Cloud Shell
gcloud sql connect pando-mysql --user=root --project=luminous-style-465017-v6

# Una vez conectado, verificar la base de datos
SHOW DATABASES;
USE pando_db;
SHOW TABLES;
```

### Verificar Variables de Entorno

En los logs de Cloud Run, deberías ver:
```
🌐 Configuración de Google Cloud SQL:
    connectionName: luminous-style-465017-v6:us-central1:pando-mysql
    host: 34.28.91.171
    database: pando_db
    user: root
    environment: production
```

## 📝 Notas Importantes

1. **Conexión Socket vs TCP**: Cloud Run intentará primero conectarse via Unix Socket. Si falla, automáticamente intentará con TCP usando la IP pública.

2. **Región de Cloud Run vs Cloud SQL**: No es necesario que estén en la misma región, pero puede afectar la latencia.

3. **Seguridad**: Asegúrate de que solo el service account especificado tenga acceso a la base de datos.

4. **Costos**: La conexión entre regiones puede incurrir en costos adicionales de transferencia de datos.

## 🆘 Solución de Problemas Comunes

### Error: "Access denied for user"
- Verifica que la contraseña en el secreto `db-password` sea correcta
- Asegúrate de que el usuario root tenga permisos desde cualquier host

### Error: "Can't connect to MySQL server"
- Verifica que la IP pública esté habilitada en Cloud SQL
- Revisa que no haya reglas de firewall bloqueando la conexión

### Error: "No such file or directory" (Socket)
- Esto es normal en el primer intento, el sistema cambiará automáticamente a TCP

## ✨ Resultado Esperado

Después de aplicar estos cambios y redesplegar, deberías ver en los logs:

```
🌐 Detectado entorno Cloud Run
🔌 Intentando conexión Unix Socket para Cloud SQL
✅ Conexión exitosa a la base de datos
✅ Base de datos inicializada correctamente
```

O si usa TCP como fallback:

```
🌐 Detectado entorno Cloud Run
🔄 Cambiando a conexión TCP con IP pública...
🌐 Usando conexión TCP para Cloud SQL (IP pública)
✅ Conexión exitosa a la base de datos
```

## 📞 Comandos de Emergencia

Si necesitas hacer cambios rápidos:

```bash
# Actualizar solo variables de entorno
gcloud run services update pando \
    --update-env-vars="CLOUD_SQL_PUBLIC_IP=34.28.91.171,DB_HOST=34.28.91.171" \
    --region=europe-west1 \
    --project=luminous-style-465017-v6

# Forzar el uso de TCP deshabilitando socket
gcloud run services update pando \
    --update-env-vars="DISABLE_CLOUD_SQL_SOCKET=true" \
    --region=europe-west1 \
    --project=luminous-style-465017-v6
```

---

💡 **Tip**: Ejecuta el script `fix-cloud-sql-connection.sh` primero para un diagnóstico completo antes de redesplegar.
