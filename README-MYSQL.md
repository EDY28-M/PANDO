# 🚀 Configuración MySQL para Proyecto LWP

Este documento te guía paso a paso para configurar MySQL Server en Windows y conectar tu proyecto LWP para guardar los contactos del formulario.

## 📋 Requisitos Previos

1. **MySQL Server 8.0+** instalado en Windows
2. **Node.js 18+** 
3. **npm** actualizado

## 🛠️ Instalación y Configuración

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Variables de Entorno

Edita el archivo `.env` y configura tus credenciales de MySQL:

```env
# Configuración de Base de Datos MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password_mysql
DB_NAME=pando_db
```

### 3. Configurar Base de Datos

Ejecuta el script de configuración automática:

```bash
npm run setup-db
```

Este script:
- ✅ Crea la base de datos `pando_db` 
- ✅ Crea la tabla `contact_submissions`
- ✅ Configura índices para rendimiento
- ✅ Inserta datos de prueba

### 4. Verificar Conexión

```bash
npm run test-db
```

### 5. Iniciar Servidor

```bash
npm start
```

O para desarrollo:
```bash
npm run dev
```

## 📊 Estructura de la Base de Datos

### Tabla: `contact_submissions`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | INT (PK) | ID único autoincremental |
| `name` | VARCHAR(100) | Nombre del contacto |
| `email` | VARCHAR(100) | Email del contacto |
| `subject` | VARCHAR(200) | Asunto del mensaje |
| `message` | TEXT | Mensaje completo |
| `ip_address` | VARCHAR(45) | IP del cliente (opcional) |
| `user_agent` | TEXT | User Agent del navegador |
| `created_at` | TIMESTAMP | Fecha de creación |
| `updated_at` | TIMESTAMP | Fecha de actualización |
| `status` | ENUM | Estado: 'new', 'read', 'replied', 'archived' |

## 🎯 Funcionalidades

### ✅ Lo que ya funciona:

1. **Formulario de Contacto**: Guarda automáticamente en MySQL
2. **Envío de Emails**: Mantiene la funcionalidad original
3. **API REST**: Para gestionar contactos
4. **Panel de Admin**: Interfaz web para ver contactos
5. **Estadísticas**: Contadores y métricas en tiempo real

### 🔗 URLs Importantes:

- **Sitio Web**: `http://localhost:3000/`
- **Panel Admin**: `http://localhost:3000/admin`
- **API Contactos**: `http://localhost:3000/api/contacts`
- **Estadísticas**: `http://localhost:3000/api/contacts/stats`
- **Estado DB**: `http://localhost:3000/api/database/status`

## 📋 Consultas SQL Útiles

### Ver todos los contactos:
```sql
SELECT * FROM contact_submissions ORDER BY created_at DESC;
```

### Ver contactos nuevos:
```sql
SELECT * FROM contact_submissions 
WHERE status = 'new' 
ORDER BY created_at DESC;
```

### Estadísticas generales:
```sql
SELECT 
    COUNT(*) as total_contactos,
    COUNT(CASE WHEN status = 'new' THEN 1 END) as nuevos,
    COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as hoy,
    COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as esta_semana
FROM contact_submissions;
```

### Marcar contacto como leído:
```sql
UPDATE contact_submissions SET status = 'read' WHERE id = 1;
```

### Buscar por email:
```sql
SELECT * FROM contact_submissions 
WHERE email LIKE '%ejemplo.com%' 
ORDER BY created_at DESC;
```

## 🛡️ Configuración de Seguridad MySQL

### 1. Crear usuario específico (Recomendado):

```sql
-- Conectarse como root
CREATE USER 'lwp_user'@'localhost' IDENTIFIED BY 'password_seguro_123';
GRANT SELECT, INSERT, UPDATE ON pando_db.* TO 'lwp_user'@'localhost';
FLUSH PRIVILEGES;
```

Luego actualiza tu `.env`:
```env
DB_USER=lwp_user
DB_PASSWORD=password_seguro_123
```

### 2. Configuración de MySQL para Windows

En `my.ini` (generalmente en `C:\ProgramData\MySQL\MySQL Server 8.0\`):

```ini
[mysqld]
# Configuración básica
port=3306
bind-address=127.0.0.1

# Configuración de caracteres
character-set-server=utf8mb4
collation-server=utf8mb4_unicode_ci

# Configuración de conexiones
max_connections=100
connect_timeout=60
wait_timeout=28800
```

## 🔧 Solución de Problemas

### Error: "Can't connect to MySQL server"
1. Verifica que MySQL esté corriendo: `services.msc` → MySQL80
2. Confirma el puerto: `SHOW VARIABLES LIKE 'port';`
3. Revisa el firewall de Windows

### Error: "Access denied for user"
1. Verifica usuario/contraseña en `.env`
2. Confirma permisos del usuario en MySQL
3. Intenta conectar manualmente: `mysql -u root -p`

### Error: "Unknown database"
1. Ejecuta: `npm run setup-db`
2. O manualmente: `CREATE DATABASE pando_db;`

### El formulario no guarda en DB
1. Verifica logs del servidor: `npm run dev`
2. Prueba conexión: `npm run test-db`
3. Revisa la URL del formulario

## 📈 Monitoreo y Mantenimiento

### Scripts disponibles:

- `npm start` - Inicia servidor en producción
- `npm run dev` - Desarrollo con auto-restart
- `npm run setup-db` - Configura base de datos
- `npm run test-db` - Prueba conexión a DB
- `npm run test-config` - Verifica configuración de email

### Logs importantes:

- ✅ "Base de datos MySQL lista para usar"
- ✅ "Contacto guardado en DB con ID: X"
- ⚠️ "Error al guardar en DB"
- 📧 "Emails enviados correctamente"

### Respaldo de datos:

```bash
# Crear respaldo
mysqldump -u root -p pando_db > backup_pando_$(date +%Y%m%d).sql

# Restaurar respaldo
mysql -u root -p pando_db < backup_pando_20240702.sql
```

## 🎉 ¡Listo!

Tu formulario de contacto ahora:
- ✅ Guarda todos los contactos en MySQL
- ✅ Mantiene el envío de emails
- ✅ Tiene panel de administración web
- ✅ Incluye estadísticas en tiempo real
- ✅ Es escalable y mantenible

### Próximos pasos opcionales:
- 🔐 Agregar autenticación al panel admin
- 📱 Hacer responsive el panel admin
- 🔔 Notificaciones push para nuevos contactos
- 📊 Gráficos y reportes avanzados
- 🚀 Deploy a producción con SSL
