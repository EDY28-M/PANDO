#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Configurando entorno de desarrollo para Kera AI Cuentas...\n');

// Contenido del archivo .env
const envContent = `# Configuración de Email para Kera AI Cuentas
# Configuración para desarrollo local

# Credenciales de Gmail (OBLIGATORIO para envío de emails)
# 1. Activa la verificación en 2 pasos en tu cuenta de Gmail
# 2. Genera una contraseña de aplicación en: https://myaccount.google.com/apppasswords
GMAIL_USER=keraaigpt.plus@gmail.com
GMAIL_PASS=tnev ssds hcpx evrw

# Configuración del servidor
NODE_ENV=development
PORT=3000

# Configuración de seguridad
SESSION_SECRET=kera-ai-secret-key-2024

# Configuración de rate limiting
MAX_EMAILS_PER_HOUR=50
MAX_EMAILS_PER_DAY=500

# Configuración de CORS para desarrollo
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# INSTRUCCIONES PARA CONFIGURAR EMAILS:
# 1. Este archivo ya está configurado con las credenciales de producción
# 2. Para desarrollo local, ejecuta: npm run dev
# 3. Para producción, las variables están en app.yaml
# 4. Para Gmail, usa una contraseña de aplicación, NO tu contraseña normal
`;

// Ruta del archivo .env
const envPath = path.join(__dirname, '.env');

try {
    // Crear archivo .env
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Archivo .env creado exitosamente');
    console.log('📁 Ubicación:', envPath);
    
    // Verificar que se creó correctamente
    if (fs.existsSync(envPath)) {
        console.log('✅ Verificación: Archivo .env existe');
        
        // Mostrar contenido (sin las contraseñas)
        const content = fs.readFileSync(envPath, 'utf8');
        const lines = content.split('\n');
        console.log('\n📋 Contenido del archivo .env:');
        lines.forEach(line => {
            if (line.includes('GMAIL_PASS=')) {
                console.log('GMAIL_PASS=***[OCULTO POR SEGURIDAD]***');
            } else if (line.trim() && !line.startsWith('#')) {
                console.log(line);
            }
        });
    }
    
    console.log('\n🎉 Configuración completada exitosamente!');
    console.log('\n📝 Próximos pasos:');
    console.log('1. Ejecuta: npm install (si no lo has hecho)');
    console.log('2. Ejecuta: npm run dev (para desarrollo)');
    console.log('3. Ejecuta: npm start (para producción local)');
    console.log('4. Visita: http://localhost:3000');
    
} catch (error) {
    console.error('❌ Error creando archivo .env:', error.message);
    console.log('\n💡 Solución manual:');
    console.log('1. Crea un archivo llamado .env en la carpeta raíz');
    console.log('2. Copia el contenido del archivo config.env.example');
    console.log('3. Actualiza las credenciales de Gmail');
} 