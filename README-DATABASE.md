# 📊 Base de Datos MySQL - Proyecto PANDO (LWP)

## 🎯 Resumen
Este documento contiene toda la información necesaria para configurar y administrar la base de datos MySQL que almacena los contactos del formulario web del proyecto PANDO (Lead Working Partner).

## 📋 Campos del Formulario de Contacto

Tu formulario web contiene los siguientes campos:

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `name` | text | ✅ Sí | Nombre completo del contacto |
| `email` | email | ✅ Sí | Correo electrónico del contacto |
| `subject` | text | ✅ Sí | Asunto o tema del mensaje |
| `message` | textarea | ✅ Sí | Mensaje detallado del contacto |

## 🗄️ Estructura de la Base de Datos

### Nombre de la Base de Datos
```
pando_db
```

### Tabla Principal: `contact_submissions`

La tabla que almacena todos los contactos del formulario web:

```sql
CREATE TABLE contact_submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT 'Nombre del contacto',
    email VARCHAR(100) NOT NULL COMMENT 'Email del contacto',
    subject VARCHAR(200) NOT NULL COMMENT 'Asunto del mensaje',
    message TEXT NOT NULL COMMENT 'Mensaje del contacto',
    ip_address VARCHAR(45) COMMENT 'Dirección IP del cliente',
    user_agent TEXT COMMENT 'User Agent del navegador',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de actualización',
    status ENUM('new', 'read', 'replied', 'archived') DEFAULT 'new' COMMENT 'Estado del contacto',
    
    -- Índices para mejorar rendimiento
    INDEX idx_email (email),
    INDEX idx_created_at (created_at),
    INDEX idx_status (status),
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Tabla para almacenar los mensajes de contacto del formulario web';
```

## ⚙️ Configuración de Variables de Entorno

Tu archivo `.env` debe contener las siguientes variables para MySQL:

```env
# Configuración de Base de Datos MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password_mysql
DB_NAME=pando_db
```

## 🚀 Scripts de Configuración Automática

### 1. Script MySQL para crear la base de datos manualmente

Si prefieres crear la base de datos manualmente usando MySQL Workbench o línea de comandos:

```sql
-- ==========================================
-- SCRIPT DE CREACIÓN DE BASE DE DATOS PANDO
-- ==========================================

-- 1. Crear la base de datos
CREATE DATABASE IF NOT EXISTS pando_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- 2. Usar la base de datos
USE pando_db;

-- 3. Crear tabla de contactos
CREATE TABLE IF NOT EXISTS contact_submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT 'Nombre del contacto',
    email VARCHAR(100) NOT NULL COMMENT 'Email del contacto',
    subject VARCHAR(200) NOT NULL COMMENT 'Asunto del mensaje',
    message TEXT NOT NULL COMMENT 'Mensaje del contacto',
    ip_address VARCHAR(45) COMMENT 'Dirección IP del cliente',
    user_agent TEXT COMMENT 'User Agent del navegador',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de actualización',
    status ENUM('new', 'read', 'replied', 'archived') DEFAULT 'new' COMMENT 'Estado del contacto',
    
    -- Índices para mejorar rendimiento
    INDEX idx_email (email),
    INDEX idx_created_at (created_at),
    INDEX idx_status (status),
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Tabla para almacenar los mensajes de contacto del formulario web';

-- 4. Insertar registro de prueba
INSERT INTO contact_submissions (name, email, subject, message, ip_address, user_agent)
VALUES (
    'Usuario de Prueba',
    'test@ejemplo.com',
    'Mensaje de Prueba',
    'Este es un mensaje de prueba para verificar que la base de datos funciona correctamente.',
    '127.0.0.1',
    'MySQL Script Setup'
);

-- 5. Verificar que todo funciona
SELECT * FROM contact_submissions;

-- ==========================================
-- VERIFICACIONES Y CONSULTAS ÚTILES
-- ==========================================

-- Ver estructura de la tabla
DESCRIBE contact_submissions;

-- Ver estadísticas de contactos
SELECT 
    COUNT(*) as total_contactos,
    COUNT(CASE WHEN status = 'new' THEN 1 END) as nuevos,
    COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as hoy,
    COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as esta_semana
FROM contact_submissions;

-- Ver contactos recientes
SELECT 
    id, 
    name, 
    email, 
    subject, 
    created_at, 
    status 
FROM contact_submissions 
ORDER BY created_at DESC 
LIMIT 10;
```

### 2. Script Node.js para configuración automática

Tu proyecto ya incluye el script `setup-database.js` que puedes ejecutar con:

```bash
# Instalar dependencias si no están instaladas
npm install

# Ejecutar configuración de base de datos
node setup-database.js
```

Este script:
- ✅ Conecta a MySQL Server
- ✅ Crea la base de datos `pando_db` automáticamente
- ✅ Crea la tabla `contact_submissions` con todos los campos
- ✅ Inserta un registro de prueba
- ✅ Verifica que todo funciona correctamente

## 🔧 Pasos de Instalación

### Paso 1: Instalar MySQL Server en Windows

1. **Descargar MySQL Server:**
   - Ve a: https://dev.mysql.com/downloads/mysql/
   - Descarga MySQL Server 8.0 para Windows
   - Ejecuta el instalador

2. **Configurar MySQL Server:**
   - Elige "Custom" en el tipo de instalación
   - Selecciona "MySQL Server" y "MySQL Workbench"
   - Configura la contraseña del usuario `root`
   - Asegúrate de que el puerto sea `3306`

3. **Verificar instalación:**
   ```bash
   # En PowerShell o CMD
   mysql --version
   ```

### Paso 2: Configurar tu proyecto

1. **Actualizar archivo .env:**
   ```env
   # Reemplaza con tu contraseña de MySQL
   DB_PASSWORD=tu_password_aqui
   ```

2. **Instalar dependencias de Node.js:**
   ```bash
   npm install mysql2 dotenv
   ```

3. **Ejecutar configuración automática:**
   ```bash
   node setup-database.js
   ```

### Paso 3: Verificar funcionamiento

1. **Iniciar tu servidor:**
   ```bash
   npm start
   # o
   node server.js
   ```

2. **Probar el formulario:**
   - Abre tu sitio web en: `http://localhost:3000`
   - Ve a la sección de contacto
   - Llena y envía el formulario
   - Verifica que se guarde en la base de datos

## 📊 Consultas SQL Útiles para Administración

### Ver todos los contactos
```sql
SELECT 
    id,
    name,
    email,
    subject,
    LEFT(message, 50) as preview_message,
    created_at,
    status
FROM contact_submissions 
ORDER BY created_at DESC;
```

### Ver solo contactos nuevos
```sql
SELECT * FROM contact_submissions 
WHERE status = 'new' 
ORDER BY created_at DESC;
```

### Marcar contacto como leído
```sql
UPDATE contact_submissions 
SET status = 'read' 
WHERE id = 1;
```

### Ver estadísticas del día
```sql
SELECT 
    COUNT(*) as contactos_hoy,
    COUNT(CASE WHEN status = 'new' THEN 1 END) as nuevos_hoy
FROM contact_submissions 
WHERE DATE(created_at) = CURDATE();
```

### Buscar contactos por email
```sql
SELECT * FROM contact_submissions 
WHERE email LIKE '%ejemplo.com%' 
ORDER BY created_at DESC;
```

### Ver los últimos 20 contactos
```sql
SELECT 
    id, 
    name, 
    email, 
    subject, 
    created_at,
    status
FROM contact_submissions 
ORDER BY created_at DESC 
LIMIT 20;
```

## 🔐 Configuración de Seguridad

### Crear usuario específico para la aplicación (Recomendado)

En lugar de usar `root`, crea un usuario específico:

```sql
-- Crear usuario para la aplicación
CREATE USER 'pando_user'@'localhost' IDENTIFIED BY 'password_seguro_aqui';

-- Dar permisos solo a la base de datos pando_db
GRANT SELECT, INSERT, UPDATE, DELETE ON pando_db.* TO 'pando_user'@'localhost';

-- Aplicar cambios
FLUSH PRIVILEGES;
```

Luego actualiza tu `.env`:
```env
DB_USER=pando_user
DB_PASSWORD=password_seguro_aqui
```

## 🚨 Solución de Problemas Comunes

### Error: "Can't connect to MySQL server"
- ✅ Verifica que MySQL Server esté corriendo
- ✅ Confirma el puerto (3306)
- ✅ Revisa las credenciales en `.env`

### Error: "Access denied for user"
- ✅ Verifica el usuario y contraseña en `.env`
- ✅ Confirma que el usuario tenga permisos

### Error: "Database doesn't exist"
- ✅ Ejecuta `node setup-database.js` para crear automáticamente
- ✅ O crea manualmente con el script SQL de arriba

### El formulario no guarda en la base de datos
- ✅ Verifica que el servidor Node.js esté corriendo
- ✅ Revisa la consola del navegador por errores
- ✅ Confirma que la conexión a MySQL funcione

## 📱 Administración desde MySQL Workbench

1. **Conectar a la base de datos:**
   - Host: `localhost`
   - Port: `3306`
   - Username: `root` (o `pando_user`)
   - Password: tu contraseña

2. **Navegar a la base de datos:**
   - Expande "Schemas"
   - Busca `pando_db`
   - Expande "Tables"
   - Haz clic derecho en `contact_submissions` > "Select Rows"

3. **Ver y administrar contactos:**
   - Todos los contactos aparecerán en una tabla
   - Puedes editar el estado directamente
   - Exportar a Excel o CSV si necesitas

## 📈 Monitoreo y Mantenimiento

### Script de respaldo diario
```bash
# Crear respaldo de la base de datos
mysqldump -u root -p pando_db > backup_pando_$(date +%Y%m%d).sql
```

### Limpiar contactos antiguos (opcional)
```sql
-- Archivar contactos de más de 6 meses
UPDATE contact_submissions 
SET status = 'archived' 
WHERE created_at < DATE_SUB(NOW(), INTERVAL 6 MONTH) 
AND status != 'archived';
```

## 🎯 Próximos Pasos

1. ✅ Configura MySQL Server en tu Windows
2. ✅ Actualiza las credenciales en `.env`
3. ✅ Ejecuta `node setup-database.js`
4. ✅ Prueba el formulario de contacto
5. ✅ Familiarízate con las consultas SQL de administración
6. ✅ Configura respaldos regulares

---

**¿Necesitas ayuda?** Si tienes problemas con algún paso, revisa la sección de solución de problemas o contacta al equipo de desarrollo.
