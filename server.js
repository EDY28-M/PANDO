const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
const emailConfig = require('./config/email');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Configurar transporter de Gmail con configuración optimizada
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: emailConfig.user,
        pass: emailConfig.pass
    },
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

// Ruta para enviar correo optimizada
app.post('/send-email', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Validar campos requeridos
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ 
                success: false, 
                message: 'Todos los campos son requeridos' 
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

        // Preparar ambos correos simultáneamente
        const adminMailOptions = {
            from: emailConfig.from,
            to: emailConfig.to,
            subject: `Nuevo contacto: ${subject}`,
            html: createAdminEmailTemplate(formData)
        };

        const clientMailOptions = {
            from: emailConfig.from,
            to: email,
            subject: 'Gracias por contactarnos - LWP Developers',
            html: createClientEmailTemplate(formData)
        };

        // Enviar ambos correos en paralelo para mayor velocidad
        const [adminResult, clientResult] = await Promise.all([
            transporter.sendMail(adminMailOptions),
            transporter.sendMail(clientMailOptions)
        ]);

        console.log('✅ Correos enviados exitosamente:', {
            admin: adminResult.messageId,
            client: clientResult.messageId,
            timestamp: new Date().toISOString()
        });

        res.json({ 
            success: true, 
            message: 'Mensaje enviado correctamente' 
        });

    } catch (error) {
        console.error('❌ Error enviando correo:', error);
        
        // Error más específico para el usuario
        let errorMessage = 'Error al enviar el mensaje. Por favor, intenta nuevamente.';
        
        if (error.code === 'EAUTH') {
            errorMessage = 'Error de autenticación del servidor de correos.';
        } else if (error.code === 'ECONNECTION') {
            errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
        } else if (error.code === 'ETIMEDOUT') {
            errorMessage = 'Tiempo de espera agotado. Intenta nuevamente.';
        }
        
        res.status(500).json({ 
            success: false, 
            message: errorMessage 
        });
    }
});

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log('✅ Servidor de correos configurado correctamente');
}); 