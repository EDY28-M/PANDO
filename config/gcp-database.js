// config/gcp-database.js
const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs').promises;
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

console.log('🌐 Configuración de Google Cloud SQL:', {
    host: process.env.CLOUD_SQL_CONNECTION_NAME ? 'Cloud SQL Socket' : (process.env.DB_HOST || 'localhost'),
    database: process.env.DB_NAME || 'pando_db',
    user: process.env.DB_USER || 'root',
    environment: process.env.NODE_ENV || 'development'
});

// Directorio para respaldo de datos
const backupDir = path.join(__dirname, '..', 'temp-download');
const contactsFile = path.join(backupDir, 'contacts.json');

// Función para determinar la configuración de conexión según el entorno
function getDbConfig() {
    const isProduction = process.env.NODE_ENV === 'production';
    const isGoogleCloud = process.env.GOOGLE_CLOUD_PROJECT || process.env.GAE_ENV;
    
    // Configuración base
    const baseConfig = {
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'pando_db',
        charset: 'utf8mb4',
        connectTimeout: 60000,
        acquireTimeout: 60000,
        timeout: 60000,
        reconnect: true,
        connectionLimit: 10,
        queueLimit: 0
    };

    // Si estamos en Google Cloud y tenemos configuración de Cloud SQL
    if (isGoogleCloud && process.env.CLOUD_SQL_CONNECTION_NAME) {
        console.log('🌐 Usando conexión Unix Socket para Cloud SQL');
        return {
            ...baseConfig,
            socketPath: `/cloudsql/${process.env.CLOUD_SQL_CONNECTION_NAME}`,
            // Para conexiones de socket no necesitamos host y port
        };
    }
    
    // Si tenemos un host público de Cloud SQL (para desarrollo o conexión externa)
    if (process.env.CLOUD_SQL_PUBLIC_IP) {
        console.log('🌐 Usando conexión TCP para Cloud SQL (IP pública)');
        return {
            ...baseConfig,
            host: process.env.CLOUD_SQL_PUBLIC_IP,
            port: parseInt(process.env.DB_PORT || '3306'),
            ssl: {
                rejectUnauthorized: false
            }
        };
    }
    
    // Configuración local/desarrollo
    console.log('💻 Usando configuración de base de datos local');
    return {
        ...baseConfig,
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306')
    };
}

// Crear pool de conexiones
const dbConfig = getDbConfig();
const pool = mysql.createPool(dbConfig);

// Variable para verificar si la base de datos está disponible
let databaseAvailable = false;

// Función para probar la conexión
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        await connection.ping();
        console.log('✅ Conexión exitosa a la base de datos');
        connection.release();
        databaseAvailable = true;
        return true;
    } catch (error) {
        console.error('❌ Error al conectar con la base de datos:', error.message);
        
        // Mensajes de ayuda específicos según el error
        if (error.code === 'ENOTFOUND') {
            console.log('💡 Verifica que el host de la base de datos sea correcto');
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('💡 Verifica las credenciales de usuario y contraseña');
        } else if (error.code === 'ECONNREFUSED') {
            console.log('💡 Verifica que la base de datos esté ejecutándose y accesible');
        }
        
        databaseAvailable = false;
        return false;
    }
}

// Función para crear la base de datos si no existe
async function createDatabase() {
    try {
        // Para Cloud SQL Socket, no podemos crear la base de datos programáticamente
        // Debe ser creada desde la consola de Google Cloud
        if (dbConfig.socketPath) {
            console.log('🌐 Base de datos debe existir en Cloud SQL');
            return;
        }
        
        // Para otras conexiones, intentar crear la base de datos
        const tempConfig = { ...dbConfig };
        delete tempConfig.database;
        const tempConnection = await mysql.createConnection(tempConfig);
        
        await tempConnection.execute(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        console.log(`✅ Base de datos '${dbConfig.database}' verificada/creada`);
        
        await tempConnection.end();
    } catch (error) {
        console.error('❌ Error al crear la base de datos:', error.message);
        throw error;
    }
}

// Función para crear las tablas necesarias
async function createTables() {
    try {
        const connection = await pool.getConnection();
        
        // Crear tabla para contactos
        const createContactsTable = `
            CREATE TABLE IF NOT EXISTS contact_submissions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL,
                subject VARCHAR(200) NOT NULL,
                message TEXT NOT NULL,
                ip_address VARCHAR(45),
                user_agent TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                status ENUM('new', 'read', 'replied', 'archived') DEFAULT 'new',
                priority ENUM('low', 'normal', 'high') DEFAULT 'normal',
                tags VARCHAR(500),
                notes TEXT,
                INDEX idx_email (email),
                INDEX idx_status (status),
                INDEX idx_created_at (created_at),
                INDEX idx_status_created (status, created_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `;
        
        await connection.execute(createContactsTable);
        console.log('✅ Tabla contact_submissions verificada/creada');
        
        // Crear tabla para configuraciones del sistema
        const createSettingsTable = `
            CREATE TABLE IF NOT EXISTS system_settings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                setting_key VARCHAR(100) NOT NULL UNIQUE,
                setting_value TEXT,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_key (setting_key)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `;
        
        await connection.execute(createSettingsTable);
        console.log('✅ Tabla system_settings verificada/creada');
        
        // Insertar configuraciones por defecto si no existen
        const defaultSettings = [
            ['site_name', 'PANDO', 'Nombre del sitio web'],
            ['admin_email', 'admin@pando.com', 'Email del administrador'],
            ['contacts_per_page', '10', 'Contactos por página en el admin'],
            ['auto_refresh', 'true', 'Auto-refresh del dashboard'],
            ['email_notifications', 'true', 'Notificaciones por email habilitadas'],
            ['maintenance_mode', 'false', 'Modo de mantenimiento']
        ];
        
        for (const [key, value, description] of defaultSettings) {
            await connection.execute(
                `INSERT IGNORE INTO system_settings (setting_key, setting_value, description) VALUES (?, ?, ?)`,
                [key, value, description]
            );
        }
        
        console.log('✅ Configuraciones por defecto verificadas');
        connection.release();
        
    } catch (error) {
        console.error('❌ Error al crear tablas:', error.message);
        throw error;
    }
}

// Función para inicializar la base de datos
async function initializeDatabase() {
    try {
        console.log('🔄 Inicializando conexión a la base de datos...');
        
        // Probar conexión
        const connected = await testConnection();
        if (!connected) {
            console.log('⚠️ Continuando sin base de datos - usando modo fallback');
            return false;
        }
        
        // Crear base de datos si es necesario (solo para conexiones locales)
        if (!dbConfig.socketPath) {
            await createDatabase();
        }
        
        // Crear tablas
        await createTables();
        
        console.log('✅ Base de datos inicializada correctamente');
        return true;
        
    } catch (error) {
        console.error('❌ Error al inicializar base de datos:', error.message);
        console.log('⚠️ Continuando sin base de datos - usando modo fallback');
        return false;
    }
}

// Funciones CRUD para contactos
async function saveContact(contactData) {
    if (!databaseAvailable) {
        return saveContactToFile(contactData);
    }
    
    try {
        const connection = await pool.getConnection();
        
        const [result] = await connection.execute(
            `INSERT INTO contact_submissions (name, email, subject, message, ip_address, user_agent) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                contactData.name,
                contactData.email,
                contactData.subject,
                contactData.message,
                contactData.ip_address || null,
                contactData.user_agent || null
            ]
        );
        
        connection.release();
        console.log('✅ Contacto guardado en base de datos, ID:', result.insertId);
        return { success: true, id: result.insertId };
        
    } catch (error) {
        console.error('❌ Error al guardar contacto:', error.message);
        // Fallback a archivo
        return saveContactToFile(contactData);
    }
}

async function getContacts(options = {}) {
    if (!databaseAvailable) {
        return getContactsFromFile(options);
    }
    
    try {
        const connection = await pool.getConnection();
        
        const { limit = 100, offset = 0, status, search } = options;
        let query = 'SELECT * FROM contact_submissions';
        let params = [];
        let conditions = [];
        
        if (status) {
            conditions.push('status = ?');
            params.push(status);
        }
        
        if (search) {
            conditions.push('(name LIKE ? OR email LIKE ? OR subject LIKE ? OR message LIKE ?)');
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }
        
        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }
        
        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);
        
        const [rows] = await connection.execute(query, params);
        connection.release();
        
        return { success: true, data: rows };
        
    } catch (error) {
        console.error('❌ Error al obtener contactos:', error.message);
        return getContactsFromFile(options);
    }
}

async function updateContactStatus(id, status) {
    if (!databaseAvailable) {
        console.log('⚠️ Base de datos no disponible para actualizar estado');
        return { success: false, message: 'Base de datos no disponible' };
    }
    
    try {
        const connection = await pool.getConnection();
        
        const [result] = await connection.execute(
            'UPDATE contact_submissions SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [status, id]
        );
        
        connection.release();
        
        if (result.affectedRows > 0) {
            console.log(`✅ Estado del contacto ${id} actualizado a ${status}`);
            return { success: true };
        } else {
            return { success: false, message: 'Contacto no encontrado' };
        }
        
    } catch (error) {
        console.error('❌ Error al actualizar estado:', error.message);
        return { success: false, message: error.message };
    }
}

async function deleteContact(id) {
    if (!databaseAvailable) {
        console.log('⚠️ Base de datos no disponible para eliminar');
        return { success: false, message: 'Base de datos no disponible' };
    }
    
    try {
        const connection = await pool.getConnection();
        
        const [result] = await connection.execute(
            'DELETE FROM contact_submissions WHERE id = ?',
            [id]
        );
        
        connection.release();
        
        if (result.affectedRows > 0) {
            console.log(`✅ Contacto ${id} eliminado`);
            return { success: true };
        } else {
            return { success: false, message: 'Contacto no encontrado' };
        }
        
    } catch (error) {
        console.error('❌ Error al eliminar contacto:', error.message);
        return { success: false, message: error.message };
    }
}

async function getContactStats() {
    if (!databaseAvailable) {
        return getStatsFromFile();
    }
    
    try {
        const connection = await pool.getConnection();
        
        // Estadísticas generales
        const [totalResult] = await connection.execute('SELECT COUNT(*) as total FROM contact_submissions');
        const total = totalResult[0].total;
        
        const [newResult] = await connection.execute('SELECT COUNT(*) as count FROM contact_submissions WHERE status = "new"');
        const newContacts = newResult[0].count;
        
        const [todayResult] = await connection.execute('SELECT COUNT(*) as count FROM contact_submissions WHERE DATE(created_at) = CURDATE()');
        const todayContacts = todayResult[0].count;
        
        const [weekResult] = await connection.execute('SELECT COUNT(*) as count FROM contact_submissions WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)');
        const weekContacts = weekResult[0].count;
        
        connection.release();
        
        return {
            success: true,
            stats: {
                total,
                new_contacts: newContacts,
                today_contacts: todayContacts,
                week_contacts: weekContacts
            }
        };
        
    } catch (error) {
        console.error('❌ Error al obtener estadísticas:', error.message);
        return getStatsFromFile();
    }
}

async function cleanupOldContacts(days = 90) {
    if (!databaseAvailable) {
        console.log('⚠️ Base de datos no disponible para limpieza');
        return { success: false, message: 'Base de datos no disponible' };
    }
    
    try {
        const connection = await pool.getConnection();
        
        const [result] = await connection.execute(
            `DELETE FROM contact_submissions 
             WHERE status IN ('archived', 'read') 
             AND created_at < DATE_SUB(NOW(), INTERVAL ? DAY)`,
            [days]
        );
        
        connection.release();
        
        console.log(`✅ Limpieza completada: ${result.affectedRows} contactos eliminados`);
        return { 
            success: true, 
            deletedCount: result.affectedRows,
            message: `${result.affectedRows} contactos antiguos eliminados`
        };
        
    } catch (error) {
        console.error('❌ Error en limpieza:', error.message);
        return { success: false, message: error.message };
    }
}

// Funciones de fallback para archivos (mantener compatibilidad)
async function saveContactToFile(contactData) {
    try {
        await fs.mkdir(backupDir, { recursive: true });
        
        let contacts = [];
        try {
            const data = await fs.readFile(contactsFile, 'utf8');
            contacts = JSON.parse(data);
        } catch (error) {
            // Archivo no existe, empezar con array vacío
        }
        
        const newContact = {
            id: Date.now(),
            ...contactData,
            created_at: new Date().toISOString(),
            status: 'new'
        };
        
        contacts.unshift(newContact);
        await fs.writeFile(contactsFile, JSON.stringify(contacts, null, 2));
        
        console.log('✅ Contacto guardado en archivo fallback');
        return { success: true, id: newContact.id };
        
    } catch (error) {
        console.error('❌ Error al guardar en archivo:', error.message);
        return { success: false, message: error.message };
    }
}

async function getContactsFromFile(options = {}) {
    try {
        const data = await fs.readFile(contactsFile, 'utf8');
        let contacts = JSON.parse(data);
        
        const { limit = 100, offset = 0, status, search } = options;
        
        // Filtrar por estado
        if (status) {
            contacts = contacts.filter(c => c.status === status);
        }
        
        // Filtrar por búsqueda
        if (search) {
            const searchLower = search.toLowerCase();
            contacts = contacts.filter(c => 
                c.name?.toLowerCase().includes(searchLower) ||
                c.email?.toLowerCase().includes(searchLower) ||
                c.subject?.toLowerCase().includes(searchLower) ||
                c.message?.toLowerCase().includes(searchLower)
            );
        }
        
        // Paginación
        const paginatedContacts = contacts.slice(offset, offset + limit);
        
        return { success: true, data: paginatedContacts };
        
    } catch (error) {
        console.log('📁 Archivo de contactos no encontrado, devolviendo array vacío');
        return { success: true, data: [] };
    }
}

async function getStatsFromFile() {
    try {
        const data = await fs.readFile(contactsFile, 'utf8');
        const contacts = JSON.parse(data);
        
        const total = contacts.length;
        const newContacts = contacts.filter(c => c.status === 'new').length;
        const today = new Date().toDateString();
        const todayContacts = contacts.filter(c => new Date(c.created_at).toDateString() === today).length;
        
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const weekContacts = contacts.filter(c => new Date(c.created_at) >= oneWeekAgo).length;
        
        return {
            success: true,
            stats: {
                total,
                new_contacts: newContacts,
                today_contacts: todayContacts,
                week_contacts: weekContacts
            }
        };
        
    } catch (error) {
        return {
            success: true,
            stats: {
                total: 0,
                new_contacts: 0,
                today_contacts: 0,
                week_contacts: 0
            }
        };
    }
}

// Exportar funciones
module.exports = {
    pool,
    testConnection,
    initializeDatabase,
    saveContact,
    getContacts,
    updateContactStatus,
    deleteContact,
    getContactStats,
    cleanupOldContacts,
    isAvailable: () => databaseAvailable
};
