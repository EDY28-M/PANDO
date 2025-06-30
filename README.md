# LWP - Lead Working Partner Website

Sitio web profesional con sistema de correos integrado usando Gmail.

## 🚀 Características

- ✅ Diseño moderno y responsivo
- ✅ Modo oscuro/claro
- ✅ Sistema de correos con Gmail
- ✅ Formulario de contacto funcional
- ✅ Animaciones y efectos visuales
- ✅ Portafolio interactivo

## 📧 Sistema de Correos

El sistema envía dos correos automáticamente:

1. **Correo al administrador**: Con todos los datos del formulario
2. **Correo al cliente**: Mensaje de agradecimiento personalizado

## 🛠️ Instalación

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar Gmail
- Asegúrate de tener habilitada la verificación en dos pasos en tu cuenta de Gmail
- Genera una contraseña de aplicación: `luyi gciz muwu adsq`
- El correo configurado es: `keraaigpt.plus@gmail.com`

### 3. Iniciar servidor
```bash
# Desarrollo (con auto-reload)
npm run dev

# Producción
npm start
```

### 4. Acceder al sitio
Abre tu navegador en: `http://localhost:3000`

## 📁 Estructura del proyecto

```
PANDO/
├── config/
│   └── email.js          # Configuración de correos
├── css/
│   ├── style.css         # Estilos principales
│   └── responsive.css    # Estilos responsivos
├── images/               # Imágenes del sitio
├── js/
│   └── script.js         # JavaScript del frontend
├── videos/               # Videos del sitio
├── index.html            # Página principal
├── server.js             # Servidor Node.js
├── package.json          # Dependencias
└── README.md             # Este archivo
```

## 🔧 Configuración de correos

El sistema está configurado para usar Gmail directamente:

- **Servicio**: Gmail SMTP
- **Puerto**: 587
- **Seguridad**: TLS
- **Autenticación**: OAuth2 con contraseña de aplicación

## 📱 Características del formulario

- ✅ Validación de campos
- ✅ Envío asíncrono
- ✅ Feedback visual
- ✅ Manejo de errores
- ✅ Limpieza automática

## 🎨 Plantillas de correo

### Correo al administrador
- Diseño profesional con colores de LWP
- Todos los datos del formulario
- Timestamp de envío
- Información del remitente

### Correo al cliente
- Mensaje de agradecimiento personalizado
- Información sobre LWP
- Características de los servicios
- Datos de contacto

## 🚀 Despliegue

Para desplegar en producción:

1. Configura las variables de entorno
2. Usa un servicio como Heroku, Vercel o Railway
3. Configura el dominio personalizado
4. Asegúrate de que el puerto sea configurable

## 📞 Soporte

Para soporte técnico o consultas:
- 📧 contacto@lwp.com.pe
- 📱 +51 999 888 777

---

**Desarrollado por LWP - Lead Working Partner** 🚀 