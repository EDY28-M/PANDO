// Configuración de email para Kera AI Cuentas
// Soporte para variables de entorno en producción y desarrollo

const user = process.env.GMAIL_USER || 'keraaigpt.plus@gmail.com';
const pass = process.env.GMAIL_PASS || 'tnev ssds hcpx evrw';

// Configuración base del transporter
const baseConfig = {
    service: 'gmail',
    user: user,
    pass: pass,
    from: `"LWP-LedWorking Partner" <${user}>`,
    replyTo: user,
    to: 'keraaigpt.plus@gmail.com',
    subject: 'Nuevo contacto de ${name} - ${subject}',
    port: 587,
    secure: false,
    requireTLS: true,
    ignoreTLS: false,
    // Configuración TLS mejorada para evitar problemas de certificados
    tls: {
        rejectUnauthorized: false,
        ciphers: 'SSLv3'
    },
    // Configuración de pool para mejor rendimiento
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    rateLimit: 14,
    rateDelta: 1000,
    socketTimeout: 60000,
    connectionTimeout: 60000,
    greetingTimeout: 30000,
    debug: process.env.NODE_ENV === 'development'
};

// Configuración específica para desarrollo
const developmentConfig = {
    ...baseConfig,
    debug: true,
    logger: true
};

// Configuración específica para producción
const productionConfig = {
    ...baseConfig,
    debug: false,
    logger: false
};

// Exportar configuración según el entorno
module.exports = process.env.NODE_ENV === 'production' ? productionConfig : developmentConfig;
