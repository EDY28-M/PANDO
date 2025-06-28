const nodemailer = require('nodemailer');
const emailConfig = require('./config/email');

console.log('🧪 Probando configuración de email para Kera AI Cuentas...\n');

// Configurar transporter
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: emailConfig.port,
    secure: emailConfig.secure,
    auth: {
        user: emailConfig.user,
        pass: emailConfig.pass
    },
    tls: emailConfig.tls,
    requireTLS: emailConfig.requireTLS,
    ignoreTLS: emailConfig.ignoreTLS,
    debug: true,
    logger: true
});

async function testEmail() {
    try {
        console.log('📧 Configuración de email:');
        console.log(`   Usuario: ${emailConfig.user}`);
        console.log(`   Puerto: ${emailConfig.port}`);
        console.log(`   Seguro: ${emailConfig.secure}`);
        console.log(`   TLS: ${emailConfig.requireTLS ? 'Requerido' : 'Opcional'}`);
        console.log('');

        // Verificar conexión
        console.log('🔍 Verificando conexión...');
        await transporter.verify();
        console.log('✅ Conexión verificada exitosamente');
        console.log('');

        // Enviar email de prueba
        console.log('📤 Enviando email de prueba...');
        const testMailOptions = {
            from: emailConfig.from,
            to: emailConfig.user, // Enviar a la misma cuenta
            subject: '🧪 Prueba de Email - Kera AI Cuentas',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
                    <h2 style="color: #FF6B35;">✅ Prueba de Email Exitosa</h2>
                    <p>Este es un email de prueba para verificar que el servicio de correo funciona correctamente.</p>
                    <div style="background: #fff3e0; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="color: #FF6B35; margin-top: 0;">Configuración Verificada:</h3>
                        <ul>
                            <li>✅ Servidor SMTP: smtp.gmail.com</li>
                            <li>✅ Puerto: ${emailConfig.port}</li>
                            <li>✅ Autenticación: ${emailConfig.user}</li>
                            <li>✅ TLS: Configurado correctamente</li>
                        </ul>
                    </div>
                    <p style="color: #666; font-size: 12px;">
                        Enviado desde: ${emailConfig.from}<br>
                        Fecha: ${new Date().toLocaleString('es-ES')}
                    </p>
                </div>
            `
        };

        const result = await transporter.sendMail(testMailOptions);
        console.log('✅ Email de prueba enviado exitosamente');
        console.log(`   Message ID: ${result.messageId}`);
        console.log(`   Respuesta: ${result.response}`);
        console.log('');

        console.log('🎉 ¡Prueba completada exitosamente!');
        console.log('📧 Revisa tu bandeja de entrada para confirmar la recepción');
        console.log('🚀 El servicio de email está listo para usar');

    } catch (error) {
        console.error('❌ Error en la prueba de email:', error.message);
        console.log('');
        
        // Errores específicos
        if (error.code === 'EAUTH') {
            console.log('🔐 Error de autenticación:');
            console.log('   - Verifica que las credenciales sean correctas');
            console.log('   - Asegúrate de usar una contraseña de aplicación');
            console.log('   - Activa la verificación en 2 pasos en Gmail');
        } else if (error.code === 'ECONNECTION') {
            console.log('🌐 Error de conexión:');
            console.log('   - Verifica tu conexión a internet');
            console.log('   - El servidor SMTP puede estar temporalmente no disponible');
        } else if (error.code === 'ETIMEDOUT') {
            console.log('⏰ Error de timeout:');
            console.log('   - El servidor tardó demasiado en responder');
            console.log('   - Intenta nuevamente en unos minutos');
        }
        
        console.log('');
        console.log('💡 Soluciones:');
        console.log('1. Verifica el archivo .env o las variables de entorno');
        console.log('2. Asegúrate de que GMAIL_USER y GMAIL_PASS estén configurados');
        console.log('3. Usa una contraseña de aplicación, no tu contraseña normal');
        console.log('4. Verifica que la verificación en 2 pasos esté activada');
    }
}

// Ejecutar prueba
testEmail(); 