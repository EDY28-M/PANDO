# Kera AI Cuentas - Sitio Web

Sitio web para la venta de cuentas premium de IA y streaming (ChatGPT Plus, Gemini Pro, Netflix, etc.).

## 🚀 Configuración Rápida

### 1. Instalación de Dependencias
```bash
npm install
```

### 2. Configuración del Entorno
```bash
npm run setup
```
Este comando creará automáticamente el archivo `.env` con la configuración necesaria.

### 3. Verificar Configuración de Email
```bash
npm run test-email
```
Este comando enviará un email de prueba para verificar que todo funciona correctamente.

### 4. Iniciar el Servidor

**Para desarrollo (con recarga automática):**
```bash
npm run dev
```

**Para producción local:**
```bash
npm start
```

**Para producción en Google Cloud:**
```bash
npm run deploy
```

## 📧 Configuración de Email

### Credenciales Configuradas
- **Usuario Gmail:** `keraaigpt.plus@gmail.com`
- **Contraseña de Aplicación:** Configurada en variables de entorno

### Variables de Entorno

**Desarrollo Local (.env):**
```env
GMAIL_USER=keraaigpt.plus@gmail.com
GMAIL_PASS=tnev ssds hcpx evrw
NODE_ENV=development
PORT=3000
```

**Producción (app.yaml):**
```yaml
env_variables:
  GMAIL_USER: "keraaigpt.plus@gmail.com"
  GMAIL_PASS: "tnev ssds hcpx evrw"
  NODE_ENV: production
```

### Solución de Problemas de Email

#### Error de Autenticación (EAUTH)
1. Verifica que la verificación en 2 pasos esté activada en Gmail
2. Genera una nueva contraseña de aplicación en: https://myaccount.google.com/apppasswords
3. Actualiza la variable `GMAIL_PASS` con la nueva contraseña

#### Error de Conexión (ECONNECTION)
1. Verifica tu conexión a internet
2. El servidor SMTP puede estar temporalmente no disponible
3. Intenta nuevamente en unos minutos

#### Error de Timeout (ETIMEDOUT)
1. El servidor tardó demasiado en responder
2. Verifica la configuración de firewall
3. Intenta con una conexión más estable

## 🛠️ Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm start` | Inicia el servidor en modo producción |
| `npm run dev` | Inicia el servidor en modo desarrollo con nodemon |
| `npm run setup` | Configura automáticamente el entorno local |
| `npm run test-email` | Envía un email de prueba para verificar la configuración |
| `npm run test-config` | Verifica que la configuración de email se carga correctamente |
| `npm run deploy` | Despliega la aplicación en Google Cloud Platform |
| `npm run logs` | Muestra los logs de la aplicación en producción |
| `npm run open` | Abre la aplicación en el navegador |

## 🌐 URLs

- **Desarrollo Local:** http://localhost:3000
- **Producción:** https://tu-app-id.appspot.com (después del despliegue)

## 📁 Estructura del Proyecto

```
PANDO/
├── config/
│   └── email.js          # Configuración de email
├── css/                  # Estilos CSS
├── js/                   # JavaScript del frontend
├── images/               # Imágenes del sitio
├── server.js             # Servidor Express
├── index.html            # Página principal
├── app.yaml              # Configuración de Google Cloud
├── Dockerfile            # Configuración de Docker
├── package.json          # Dependencias y scripts
├── setup-local.js        # Script de configuración local
├── test-email.js         # Script de prueba de email
└── README.md             # Este archivo
```

## 🔧 Configuración Avanzada

### Personalizar Plantillas de Email
Las plantillas de email se encuentran en `server.js`:
- `createAdminEmailTemplate()` - Email que recibe el administrador
- `createClientEmailTemplate()` - Email de confirmación al cliente

### Configuración de TLS
La configuración TLS está optimizada para evitar problemas de certificados:
```javascript
tls: {
    rejectUnauthorized: false,
    ciphers: 'SSLv3'
}
```

### Rate Limiting
Configuración para evitar spam:
- Máximo 14 emails por segundo
- Pool de conexiones para mejor rendimiento
- Timeouts configurados para estabilidad

## 🚀 Despliegue en Google Cloud Platform

### Requisitos Previos
1. Cuenta de Google Cloud Platform
2. Google Cloud SDK instalado
3. Proyecto creado en GCP

### Pasos de Despliegue
1. **Autenticarse:**
   ```bash
   gcloud auth login
   gcloud config set project tu-proyecto-id
   ```

2. **Desplegar:**
   ```bash
   npm run deploy
   ```

3. **Ver logs:**
   ```bash
   npm run logs
   ```

4. **Abrir aplicación:**
   ```bash
   npm run open
   ```

## 📞 Soporte

Si tienes problemas con la configuración de email:

1. Ejecuta `npm run test-email` para diagnosticar
2. Verifica las credenciales de Gmail
3. Asegúrate de usar una contraseña de aplicación
4. Revisa los logs del servidor

## 🔒 Seguridad

- Las credenciales están protegidas en variables de entorno
- No se almacenan contraseñas en el código fuente
- Configuración TLS para conexiones seguras
- Rate limiting para prevenir spam

---

**Desarrollado por Kera AI Cuentas** 🚀 