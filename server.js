const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
const emailConfig = require('./config/email');
const database = require('./config/database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Configurar transporter de Gmail con configuración optimizada
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Usar STARTTLS
    auth: {
        user: emailConfig.user,
        pass: emailConfig.pass
    },
    // Configuración TLS para solucionar problemas de certificados
    tls: {
        rejectUnauthorized: false,
        ciphers: 'SSLv3'
    },
    // Configuración adicional para desarrollo y producción
    requireTLS: true,
    ignoreTLS: false,
    // Configuración para envío más rápido
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    rateLimit: 14, // Máximo 14 emails por segundo
    rateDelta: 1000, // En ventana de 1 segundo
    socketTimeout: 60000, // 60 segundos
    connectionTimeout: 60000,
    greetingTimeout: 30000,
    debug: false
});

// Verificar conexión del transporter
transporter.verify(function(error, success) {
    if (error) {
        console.log('❌ Error en configuración de correo:', error);
    } else {
        console.log('✅ Servidor de correos configurado correctamente');
    }
});

// Inicializar base de datos al arrancar el servidor
database.initializeDatabase().then(success => {
    if (success) {
        console.log('✅ Base de datos MySQL lista para usar');
    } else {
        console.log('⚠️ Advertencia: Problemas con la base de datos MySQL');
    }
});

// Plantilla HTML para correo al administrador
function createAdminEmailTemplate(formData) {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { 
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                    line-height: 1.5; 
                    color: #333; 
                    margin: 0; 
                    padding: 0; 
                    background: #f5f5f5;
                }
                .container { 
                    max-width: 500px; 
                    margin: 20px auto; 
                    background: #fff; 
                    border-radius: 8px; 
                    overflow: hidden; 
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
                }
                .header { 
                    background: linear-gradient(135deg, #2E8B57, #3CB371); 
                    color: white; 
                    padding: 20px; 
                    text-align: center; 
                }
                .header h1 { 
                    margin: 0; 
                    font-size: 20px; 
                    font-weight: 600;
                }
                .header p { 
                    margin: 5px 0 0 0; 
                    opacity: 0.9; 
                    font-size: 14px;
                }
                .content { 
                    padding: 25px; 
                }
                .field { 
                    margin-bottom: 15px; 
                    padding: 12px; 
                    background: #f8f9fa; 
                    border-radius: 6px; 
                    border-left: 3px solid #2E8B57; 
                }
                .label { 
                    font-weight: 600; 
                    color: #2E8B57; 
                    margin-bottom: 3px; 
                    display: block; 
                    font-size: 13px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .value { 
                    color: #333; 
                    word-wrap: break-word; 
                    font-size: 14px;
                }
                .footer { 
                    text-align: center; 
                    margin-top: 20px; 
                    padding-top: 15px; 
                    border-top: 1px solid #eee; 
                    color: #888; 
                    font-size: 11px; 
                }
                .timestamp { 
                    background: #e8f5e8; 
                    padding: 8px; 
                    border-radius: 4px; 
                    text-align: center; 
                    margin-top: 15px; 
                    font-size: 11px;
                    color: #2E8B57;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>📧 Nuevo Mensaje</h1>
                    <p>LWP - Lead Working Partner</p>
                </div>
                <div class="content">
                    <div class="field">
                        <span class="label">👤 Nombre</span>
                        <div class="value">${formData.name}</div>
                    </div>
                    <div class="field">
                        <span class="label">📧 Email</span>
                        <div class="value">${formData.email}</div>
                    </div>
                    <div class="field">
                        <span class="label">📋 Asunto</span>
                        <div class="value">${formData.subject}</div>
                    </div>
                    <div class="field">
                        <span class="label">💬 Mensaje</span>
                        <div class="value">${formData.message.replace(/\n/g, '<br>')}</div>
                    </div>
                    <div class="timestamp">
                        📅 ${new Date().toLocaleString('es-ES')}
                    </div>
                    <div class="footer">
                        <p>Enviado desde el formulario web de LWP</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;
}

// Plantilla HTML para correo de agradecimiento al cliente
function createClientEmailTemplate(formData) {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { 
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                    line-height: 1.5; 
                    color: #333; 
                    margin: 0; 
                    padding: 0; 
                    background: #f5f5f5;
                }
                .container { 
                    max-width: 500px; 
                    margin: 20px auto; 
                    background: #fff; 
                    border-radius: 8px; 
                    overflow: hidden; 
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
                }
                .header { 
                    background: linear-gradient(135deg, #2E8B57, #3CB371); 
                    color: white; 
                    padding: 25px; 
                    text-align: center; 
                }
                .header h1 { 
                    margin: 0; 
                    font-size: 22px; 
                    font-weight: 600;
                }
                .header p { 
                    margin: 5px 0 0 0; 
                    opacity: 0.9; 
                    font-size: 14px;
                }
                .content { 
                    padding: 25px; 
                }
                .greeting { 
                    font-size: 16px; 
                    margin-bottom: 15px; 
                    color: #2E8B57; 
                    font-weight: 600;
                }
                .message { 
                    margin-bottom: 20px; 
                    font-size: 14px;
                    line-height: 1.6;
                }
                .features { 
                    background: #f8f9fa; 
                    padding: 15px; 
                    border-radius: 6px; 
                    margin: 20px 0; 
                    border-left: 3px solid #2E8B57; 
                }
                .features h3 { 
                    color: #2E8B57; 
                    margin: 0 0 10px 0; 
                    font-size: 16px;
                }
                .feature { 
                    margin: 8px 0; 
                    padding-left: 15px; 
                    position: relative; 
                    font-size: 13px;
                }
                .feature:before { 
                    content: "✅"; 
                    position: absolute; 
                    left: 0; 
                }
                .footer { 
                    text-align: center; 
                    margin-top: 20px; 
                    padding-top: 15px; 
                    border-top: 1px solid #eee; 
                }
                .contact-info { 
                    background: #e8f5e8; 
                    padding: 12px; 
                    border-radius: 6px; 
                    margin: 15px 0; 
                    text-align: center; 
                    font-size: 13px;
                }
                .auto-message { 
                    font-size: 10px; 
                    color: #888; 
                    font-style: italic; 
                    margin-top: 15px; 
                    text-align: center;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>¡Gracias por contactarnos! 🎉</h1>
                    <p>LWP - Lead Working Partner</p>
                </div>
                <div class="content">
                    <div class="greeting">
                        Hola <strong>${formData.name}</strong>,
                    </div>
                    <div class="message">
                        <p>Hemos recibido tu mensaje y queremos agradecerte por tu interés en nuestros servicios.</p>
                        <p>Nuestro equipo revisará tu solicitud y te contactaremos en las próximas 24 horas.</p>
                    </div>
                    <div class="features">
                        <h3>🚀 ¿Por qué elegir LWP?</h3>
                        <div class="feature">Desarrollo de software a medida</div>
                        <div class="feature">Soluciones web modernas y responsivas</div>
                        <div class="feature">Soporte técnico especializado</div>
                        <div class="feature">Experiencia en múltiples tecnologías</div>
                    </div>
                    <div class="contact-info">
                        <p><strong>📧 contacto@lwp.com.pe</strong></p>
                        <p><strong>📱 +51 999 888 777</strong></p>
                    </div>
                    <div class="footer">
                        <p><strong>Atentamente,</strong></p>
                        <p><strong>El Equipo de LWP Developers</strong></p>
                    </div>
                    <div class="auto-message">
                        Este es un correo automático, por favor no responder directamente.
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;
}

// Ruta para enviar correo optimizada con MySQL
app.post('/send-email', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Validar campos requeridos
        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos son obligatorios'
            });
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Formato de email inválido'
            });
        }

        const formData = { name, email, subject, message };
        
        // Obtener información adicional de la solicitud
        const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 'unknown';
        const userAgent = req.get('User-Agent') || 'unknown';

        // 1. GUARDAR EN BASE DE DATOS PRIMERO (PRIORIDAD)
        const dbResult = await database.insertContact({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            subject: subject.trim(),
            message: message.trim(),
            ip_address: clientIP,
            user_agent: userAgent
        });

        if (!dbResult.success) {
            console.error('❌ Error al guardar en DB:', dbResult.error);
            // Continuar con el envío de email aunque falle la DB
        } else {
            console.log(`✅ Contacto guardado en DB con ID: ${dbResult.id}`);
        }

        // 2. ENVIAR EMAILS (como funcionalidad secundaria)
        let emailsSuccessful = false;
        try {
            // Preparar ambos correos simultáneamente
            const adminMailOptions = {
                from: `"${name}" <${emailConfig.user}>`,
                to: emailConfig.user,
                subject: `Nuevo mensaje de ${name}: ${subject}`,
                html: createAdminEmailTemplate(formData),
                replyTo: email
            };

            const clientMailOptions = {
                from: `"LWP Team" <${emailConfig.user}>`,
                to: email,
                subject: 'Gracias por contactarnos - LWP',
                html: createClientEmailTemplate(formData)
            };

            // Enviar ambos emails de forma asíncrona
            const [adminResult, clientResult] = await Promise.all([
                transporter.sendMail(adminMailOptions),
                transporter.sendMail(clientMailOptions)
            ]);

            console.log('✅ Emails enviados correctamente:', {
                admin: adminResult.messageId,
                client: clientResult.messageId,
                timestamp: new Date().toISOString()
            });
            
            emailsSuccessful = true;
            
        } catch (emailError) {
            console.error('⚠️ Error al enviar emails:', emailError.message);
            // No falla la respuesta si el email falla, ya que se guardó en DB
        }

        // Respuesta exitosa (prioriza que se guardó en DB)
        res.json({
            success: true,
            message: emailsSuccessful ? 
                'Mensaje recibido y guardado exitosamente. Te hemos enviado un email de confirmación.' :
                'Mensaje recibido y guardado exitosamente. Te contactaremos pronto.',
            id: dbResult.id || null,
            saved_to_database: dbResult.success,
            emails_sent: emailsSuccessful
        });

    } catch (error) {
        console.error('❌ Error general en /send-email:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor. Por favor intenta más tarde.'
        });
    }
});

// Ruta para obtener todos los contactos (para administración)
app.get('/api/contacts', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        const result = await database.getAllContacts(limit, offset);
        
        if (result.success) {
            res.json({
                success: true,
                data: result.data,
                pagination: {
                    current_page: page,
                    limit: limit,
                    offset: offset
                }
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Error al obtener contactos'
            });
        }
    } catch (error) {
        console.error('Error en /api/contacts:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// Ruta para obtener estadísticas de contactos
app.get('/api/contacts/stats', async (req, res) => {
    try {
        const result = await database.getContactStats();
        
        if (result.success) {
            res.json({
                success: true,
                stats: result.stats
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Error al obtener estadísticas'
            });
        }
    } catch (error) {
        console.error('Error en /api/contacts/stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// Ruta para verificar el estado de la base de datos
app.get('/api/database/status', async (req, res) => {
    try {
        const isConnected = await database.testConnection();
        res.json({
            success: true,
            database_connected: isConnected,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            database_connected: false,
            error: error.message
        });
    }
});

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Ruta para la página de administración
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log('✅ Servidor de correos configurado correctamente');
}); 