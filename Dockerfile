# Usar Node.js 18 Alpine como base
FROM node:18-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Instalar dependencias del sistema necesarias
RUN apk add --no-cache python3 make g++

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias de producción
RUN npm ci --only=production && npm cache clean --force

# Copiar código fuente
COPY . .

# Crear directorio de uploads
RUN mkdir -p uploads

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Cambiar propiedad de archivos al usuario nodejs
RUN chown -R nodejs:nodejs /app
USER nodejs

# Exponer puerto
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Comando para ejecutar la aplicación
CMD ["npm", "start"] 