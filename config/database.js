// config/database.js
const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs').promises;
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

console.log('📊 Configuración de DB:', {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD ? '***' : 'NO_PASSWORD',
    database: process.env.DB_NAME || 'pando_db'
});

// Directorio para respaldo de datos
const backupDir = path.join(__dirname, '..', 'temp-download');
const contactsFile = path.join(backupDir, 'contacts.json');

// Configuración de la conexión a MySQL
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'pando_db',
    // Configuraciones adicionales para Windows MySQL Server
    connectTimeout: 60000,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true,
    charset: 'utf8mb4',
    // Configuración del pool de conexiones
    connectionLimit: 10,
    queueLimit: 0
};

// Crear pool de conexiones
const pool = mysql.createPool(dbConfig);

// Variable para verificar si MySQL está disponible
let mysqlAvailable = false;

// Función para probar la conexión
async function testConnection() {
    try {
        if (!dbConfig.password) {
            console.log('⚠️ No hay contraseña configurada para MySQL');
            return false;
        }
        
        const connection = await pool.getConnection();
        console.log('✅ Conexión exitosa a MySQL');
        connection.release();
        mysqlAvailable = true;
        return true;
    } catch (error) {
        console.error('❌ Error al conectar con MySQL:', error.message);
        console.log('💡 Asegúrate de que MySQL esté ejecutándose y las credenciales sean correctas');
        mysqlAvailable = false;
        return false;
    }
}

// Función para crear la base de datos si no existe
async function createDatabase() {
    try {
        // Conectar sin especificar la base de datos
        const tempConfig = { ...dbConfig };
        delete tempConfig.database;
        const tempConnection = await mysql.createConnection(tempConfig);
        
        // Crear la base de datos si no existe
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
                INDEX idx_email (email),
                INDEX idx_created_at (created_at),
                INDEX idx_status (status)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `;
        
        await connection.execute(createContactsTable);
        console.log('✅ Tabla contact_submissions verificada/creada');
        
        connection.release();
    } catch (error) {
        console.error('❌ Error al crear tablas:', error.message);
        throw error;
    }
}

// Función para inicializar la base de datos
async function initializeDatabase() {
    try {
        if (!dbConfig.password) {
            console.log('⚠️ No hay contraseña de MySQL configurada, usando respaldo JSON');
            mysqlAvailable = false;
            return true;
        }
        
        await createDatabase();
        const connected = await testConnection();
        if (connected) {
            await createTables();
            console.log('✅ Base de datos MySQL inicializada correctamente');
            mysqlAvailable = true;
            return true;
        } else {
            console.log('⚠️ MySQL no disponible, usando respaldo JSON');
            mysqlAvailable = false;
            return true;
        }
    } catch (error) {
        console.error('❌ Error al inicializar MySQL:', error.message);
        console.log('🔄 Usando sistema de respaldo JSON');
        mysqlAvailable = false;
        return true; // Retorna true porque el respaldo está disponible
    }
}

// Función para guardar contacto en archivo JSON (respaldo)
async function saveContactToFile(contactData) {
    try {
        const contact = {
            id: Date.now(),
            ...contactData,
            created_at: new Date().toISOString(),
            status: 'new'
        };

        let contacts = [];
        try {
            const data = await fs.readFile(contactsFile, 'utf8');
            contacts = JSON.parse(data);
        } catch (error) {
            // Archivo no existe, crear array vacío
            contacts = [];
        }

        contacts.push(contact);
        await fs.writeFile(contactsFile, JSON.stringify(contacts, null, 2));
        
        console.log(`✅ Contacto guardado en archivo de respaldo con ID: ${contact.id}`);
        return {
            success: true,
            id: contact.id,
            message: 'Contacto guardado en archivo de respaldo'
        };
    } catch (error) {
        console.error('❌ Error al guardar en archivo de respaldo:', error.message);
        return {
            success: false,
            message: 'Error al guardar contacto'
        };
    }
}

// Función para insertar un nuevo contacto
async function insertContact(contactData) {
    try {
        // Intentar guardar en MySQL primero
        if (mysqlAvailable) {
            const connection = await pool.getConnection();
            
            const insertQuery = `
                INSERT INTO contact_submissions (name, email, subject, message, ip_address, user_agent)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            
            const [result] = await connection.execute(insertQuery, [
                contactData.name,
                contactData.email,
                contactData.subject,
                contactData.message,
                contactData.ip_address || null,
                contactData.user_agent || null
            ]);
            
            connection.release();
            
            console.log(`✅ Contacto guardado con ID: ${result.insertId}`);
            return {
                success: true,
                id: result.insertId,
                message: 'Contacto guardado exitosamente'
            };
        } else {
            // Si MySQL no está disponible, guardar en archivo JSON
            return await saveContactToFile(contactData);
        }
        
    } catch (error) {
        console.error('❌ Error al guardar contacto:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

// Función para obtener todos los contactos
async function getAllContacts(limit = 50, offset = 0) {
    try {
        // Si MySQL está disponible, obtener desde MySQL
        if (mysqlAvailable) {
            const connection = await pool.getConnection();
            
            const selectQuery = `
                SELECT id, name, email, subject, message, created_at, status
                FROM contact_submissions
                ORDER BY created_at DESC
                LIMIT 50
            `;
            
            const [rows] = await connection.execute(selectQuery);
            connection.release();
            
            return {
                success: true,
                data: rows
            };
        } else {
            // Si MySQL no está disponible, obtener desde archivo JSON
            return await getContactsFromFile(limit, offset);
        }
        
    } catch (error) {
        console.error('❌ Error al obtener contactos:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

// Función para obtener estadísticas
async function getContactStats() {
    try {
        // Si MySQL está disponible, obtener estadísticas desde MySQL
        if (mysqlAvailable) {
            const connection = await pool.getConnection();
            
            const statsQuery = `
                SELECT 
                    COUNT(*) as total,
                    COUNT(CASE WHEN status = 'new' THEN 1 END) as new_contacts,
                    COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as today_contacts,
                    COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as week_contacts
                FROM contact_submissions
            `;
            
            const [rows] = await connection.execute(statsQuery);
            connection.release();
            
            return {
                success: true,
                stats: rows[0]
            };
        } else {
            // Si MySQL no está disponible, obtener estadísticas desde archivo JSON
            return await getStatsFromFile();
        }
        
    } catch (error) {
        console.error('❌ Error al obtener estadísticas:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

module.exports = {
    pool,
    testConnection,
    initializeDatabase,
    insertContact,
    getAllContacts,
    getContactStats
};
