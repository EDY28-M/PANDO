#!/usr/bin/env node

// Script para probar la conexión a Cloud SQL
const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

console.log('🔍 Script de prueba de conexión a Cloud SQL');
console.log('==========================================\n');

// Configuración de prueba
const configs = [
    {
        name: 'Conexión con IP Pública (TCP)',
        config: {
            host: '34.28.91.171',
            port: 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'pando_db',
            connectTimeout: 20000,
            ssl: {
                rejectUnauthorized: false
            }
        }
    },
    {
        name: 'Conexión con Unix Socket',
        config: {
            socketPath: `/cloudsql/${process.env.CLOUD_SQL_CONNECTION_NAME || 'luminous-style-465017-v6:us-central1:pando-mysql'}`,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'pando_db',
            connectTimeout: 20000
        }
    },
    {
        name: 'Conexión Local/Desarrollo',
        config: {
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '3306'),
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'pando_db',
            connectTimeout: 20000
        }
    }
];

// Función para probar una configuración
async function testConfig(name, config) {
    console.log(`\n📋 Probando: ${name}`);
    console.log('Configuración:', {
        ...config,
        password: config.password ? '***' : 'NO_PASSWORD'
    });
    
    try {
        console.log('⏳ Intentando conectar...');
        const connection = await mysql.createConnection(config);
        
        console.log('✅ ¡Conexión exitosa!');
        
        // Probar query simple
        const [rows] = await connection.execute('SELECT 1 as test');
        console.log('✅ Query de prueba exitosa:', rows);
        
        // Verificar tablas
        const [tables] = await connection.execute('SHOW TABLES');
        console.log(`📊 Tablas encontradas: ${tables.length}`);
        tables.forEach(table => {
            const tableName = Object.values(table)[0];
            console.log(`   - ${tableName}`);
        });
        
        await connection.end();
        return true;
        
    } catch (error) {
        console.log('❌ Error de conexión:', error.message);
        
        // Mensajes de ayuda específicos
        if (error.code === 'ENOTFOUND') {
            console.log('💡 El host no se puede resolver. Verifica la IP o hostname.');
        } else if (error.code === 'ETIMEDOUT') {
            console.log('💡 Timeout de conexión. Verifica que Cloud SQL permita conexiones desde tu IP.');
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('💡 Acceso denegado. Verifica usuario y contraseña.');
            console.log('💡 Asegúrate de que el usuario tenga permisos desde cualquier host (%)');
        } else if (error.code === 'ECONNREFUSED') {
            console.log('💡 Conexión rechazada. Verifica que el servicio MySQL esté activo.');
        } else if (error.code === 'ENOENT') {
            console.log('💡 Socket Unix no encontrado. Esto es normal fuera de Cloud Run.');
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            console.log('💡 La base de datos no existe. Créala primero en Cloud SQL.');
        }
        
        return false;
    }
}

// Función principal
async function main() {
    console.log('🔧 Variables de entorno detectadas:');
    console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'No definido'}`);
    console.log(`   DB_HOST: ${process.env.DB_HOST || 'No definido'}`);
    console.log(`   DB_USER: ${process.env.DB_USER || 'No definido'}`);
    console.log(`   DB_PASSWORD: ${process.env.DB_PASSWORD ? '***' : 'No definido'}`);
    console.log(`   DB_NAME: ${process.env.DB_NAME || 'No definido'}`);
    console.log(`   CLOUD_SQL_CONNECTION_NAME: ${process.env.CLOUD_SQL_CONNECTION_NAME || 'No definido'}`);
    console.log(`   CLOUD_SQL_PUBLIC_IP: ${process.env.CLOUD_SQL_PUBLIC_IP || 'No definido'}`);
    
    let successfulConnection = false;
    
    // Probar cada configuración
    for (const { name, config } of configs) {
        const success = await testConfig(name, config);
        if (success) {
            successfulConnection = true;
            console.log(`\n🎉 Conexión exitosa con: ${name}`);
            break;
        }
    }
    
    if (!successfulConnection) {
        console.log('\n❌ No se pudo establecer conexión con ninguna configuración.');
        console.log('\n📝 Pasos para solucionar:');
        console.log('1. Verifica que la contraseña de MySQL esté configurada correctamente');
        console.log('2. Si estás probando localmente, asegúrate de que tu IP esté autorizada en Cloud SQL');
        console.log('3. Verifica que el usuario root tenga permisos desde % (cualquier host)');
        console.log('4. Ejecuta este comando para autorizar tu IP:');
        console.log('   gcloud sql instances patch pando-mysql --authorized-networks=TU_IP_PUBLICA');
        
        // Intentar obtener IP pública
        try {
            const https = require('https');
            https.get('https://api.ipify.org?format=json', (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    const ip = JSON.parse(data).ip;
                    console.log(`\n🌐 Tu IP pública es: ${ip}`);
                    console.log(`   Comando para autorizar tu IP:`);
                    console.log(`   gcloud sql instances patch pando-mysql --authorized-networks=${ip} --project=luminous-style-465017-v6`);
                });
            });
        } catch (e) {
            // Ignorar error
        }
    }
}

// Ejecutar
main().catch(console.error);
