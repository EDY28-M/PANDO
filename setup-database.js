require('dotenv').config();
const mysql = require('mysql2/promise');

async function setupDatabase() {
  console.log('🚀 Iniciando configuración de base de datos MySQL...\n');
  
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true  // Permitir múltiples statements
  };
  
  console.log('📋 Configuración de conexión:');
  console.log(`   Host: ${dbConfig.host}`);
  console.log(`   Puerto: ${dbConfig.port}`);
  console.log(`   Usuario: ${dbConfig.user}`);
  console.log(`   Base de datos: pando_db\n`);
  
  let connection;
  
  try {
    console.log('🔌 Conectando a MySQL Server...');
    // Primero conectamos sin especificar una base de datos
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conexión exitosa a MySQL Server\n');
    
    // Crear la base de datos si no existe (esto no usa prepared statements)
    console.log('📂 Creando base de datos \'pando_db\' si no existe...');
    await connection.query('CREATE DATABASE IF NOT EXISTS pando_db');
    console.log('✅ Base de datos verificada/creada exitosamente\n');
    
    // Cerrar la conexión inicial
    await connection.end();
    
    // Crear una nueva conexión especificando la base de datos
    const dbConfigWithDB = {
      ...dbConfig,
      database: 'pando_db'
    };
    
    connection = await mysql.createConnection(dbConfigWithDB);
    console.log('🔌 Conectado a la base de datos pando_db\n');
    
    // Crear tabla de usuarios
        console.log('📋 Creando tabla contact_submissions...');
        const createTableSQL = `
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
        `;

        await connection.execute(createTableSQL);
        console.log('✅ Tabla contact_submissions creada exitosamente\n');
    
    console.log('🎉 Configuración de base de datos completada exitosamente!');
  } catch (error) {
    console.error('\n❌ Error durante la configuración:', error.message);
    console.log('\n🔧 POSIBLES SOLUCIONES:');
    console.log('1. Verifica que MySQL Server esté corriendo');
    console.log('2. Confirma las credenciales en el archivo .env');
    console.log('3. Asegúrate de que el usuario tenga permisos para crear bases de datos');
    console.log('4. Verifica la conexión de red al servidor MySQL');
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupDatabase();