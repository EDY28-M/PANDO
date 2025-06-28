# Usar imagen oficial de Node.js 20
FROM node:20-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código de la aplicación
COPY . .

# Exponer puerto
EXPOSE 8080

# Comando para ejecutar la aplicación
CMD ["npm", "start"] 