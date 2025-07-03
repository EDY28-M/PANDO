// setup-gcp-database.js
const database = require('./config/gcp-database');
require('dotenv').config();

console.log('🌐 PANDO - Configuración de Google Cloud SQL');
console.log('='.repeat(50));

async function setupGCPDatabase() {
    try {
        console.log('🔄 Inicializando conexión con Google Cloud SQL...');
        
        // Verificar variables de entorno
        console.log('\n📋 Verificando configuración:');
        console.log(`- Proyecto: ${process.env.GOOGLE_CLOUD_PROJECT || 'NO CONFIGURADO'}`);
        console.log(`- Cloud SQL Instance: ${process.env.CLOUD_SQL_CONNECTION_NAME || 'NO CONFIGURADO'}`);
        console.log(`- Base de datos: ${process.env.DB_NAME || 'pando_db'}`);
        console.log(`- Usuario: ${process.env.DB_USER || 'root'}`);
        console.log(`- Entorno: ${process.env.NODE_ENV || 'development'}`);
        
        // Verificar si estamos en Google Cloud
        const isGoogleCloud = process.env.GOOGLE_CLOUD_PROJECT || process.env.GAE_ENV;
        if (!isGoogleCloud) {
            console.log('\n⚠️ No se detectó entorno de Google Cloud');
            console.log('   Ejecutando en modo de desarrollo local');
        }
        
        // Intentar inicializar la base de datos
        console.log('\n🔄 Inicializando base de datos...');
        const success = await database.initializeDatabase();
        
        if (success) {
            console.log('\n✅ ¡Base de datos configurada exitosamente!');
            
            // Probar operaciones básicas
            console.log('\n🧪 Probando operaciones básicas...');
            
            // Probar inserción de contacto de prueba
            const testContact = {
                name: 'Test Contact',
                email: 'test@pando.com',
                subject: 'Prueba de configuración',
                message: 'Este es un contacto de prueba para verificar la configuración de Google Cloud SQL.',
                ip_address: '127.0.0.1',
                user_agent: 'Setup Script'
            };
            
            const saveResult = await database.saveContact(testContact);
            if (saveResult.success) {
                console.log('✅ Inserción de contacto: OK');
                
                // Probar obtención de contactos
                const getResult = await database.getContacts({ limit: 1 });
                if (getResult.success && getResult.data.length > 0) {
                    console.log('✅ Lectura de contactos: OK');
                    
                    // Probar estadísticas
                    const statsResult = await database.getContactStats();
                    if (statsResult.success) {
                        console.log('✅ Estadísticas: OK');
                        console.log(`   Total de contactos: ${statsResult.stats.total}`);
                        
                        // Limpiar contacto de prueba
                        if (saveResult.id) {
                            await database.deleteContact(saveResult.id);
                            console.log('✅ Limpieza de datos de prueba: OK');
                        }
                    }
                }
            }
            
            console.log('\n🎉 ¡Configuración completada exitosamente!');
            console.log('\n📝 Próximos pasos:');
            console.log('   1. Ejecuta: npm start (para iniciar el servidor)');
            console.log('   2. Visita: http://localhost:3000 (desarrollo local)');
            console.log('   3. Admin panel: http://localhost:3000/admin.html');
            
            if (isGoogleCloud) {
                console.log('   4. Deploy: gcloud app deploy');
            }
            
        } else {
            console.log('\n❌ Error en la configuración de la base de datos');
            console.log('\n🔧 Acciones recomendadas:');
            console.log('   1. Verifica que Cloud SQL esté configurado correctamente');
            console.log('   2. Comprueba las credenciales en .env o app.yaml');
            console.log('   3. Asegúrate de que la instancia de Cloud SQL esté activa');
            console.log('   4. Verifica la configuración de red y firewall');
            
            if (!isGoogleCloud) {
                console.log('   5. Para desarrollo local, configura MySQL local o usa Cloud SQL IP pública');
            }
        }
        
    } catch (error) {
        console.error('\n💥 Error durante la configuración:', error.message);
        console.log('\n🔧 Acciones recomendadas:');
        console.log('   1. Verifica tu configuración de .env');
        console.log('   2. Asegúrate de tener permisos en Google Cloud');
        console.log('   3. Comprueba que Cloud SQL esté configurado');
        console.log('   4. Revisa los logs para más detalles');
    }
}

// Función para mostrar ayuda sobre Cloud SQL
function showCloudSQLHelp() {
    console.log('\n📖 GUÍA DE CONFIGURACIÓN DE GOOGLE CLOUD SQL');
    console.log('='.repeat(60));
    console.log('\n1️⃣ Crear instancia de Cloud SQL:');
    console.log('   gcloud sql instances create pando-mysql \\');
    console.log('     --database-version=MYSQL_8_0 \\');
    console.log('     --tier=db-f1-micro \\');
    console.log('     --region=us-central1');
    
    console.log('\n2️⃣ Crear base de datos:');
    console.log('   gcloud sql databases create pando_db --instance=pando-mysql');
    
    console.log('\n3️⃣ Configurar contraseña de root:');
    console.log('   gcloud sql users set-password root \\');
    console.log('     --host=% \\');
    console.log('     --instance=pando-mysql \\');
    console.log('     --password=TU_CONTRASEÑA_SEGURA');
    
    console.log('\n4️⃣ Variables de entorno necesarias:');
    console.log('   GOOGLE_CLOUD_PROJECT=tu-proyecto-id');
    console.log('   CLOUD_SQL_CONNECTION_NAME=tu-proyecto:us-central1:pando-mysql');
    console.log('   DB_USER=root');
    console.log('   DB_PASSWORD=tu-contraseña');
    console.log('   DB_NAME=pando_db');
    
    console.log('\n5️⃣ Para conectar localmente (opcional):');
    console.log('   gcloud sql connect pando-mysql --user=root');
    
    console.log('\n📋 Más información:');
    console.log('   https://cloud.google.com/sql/docs/mysql/quickstart');
}

// Verificar argumentos de línea de comandos
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
    showCloudSQLHelp();
    process.exit(0);
}

// Ejecutar configuración
if (require.main === module) {
    setupGCPDatabase()
        .then(() => {
            console.log('\n✨ Script completado');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Error fatal:', error);
            process.exit(1);
        });
}

module.exports = { setupGCPDatabase, showCloudSQLHelp };
