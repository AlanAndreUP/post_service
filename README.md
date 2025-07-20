# Foro Service - API Hexagonal DDD

Una API RESTful para crear y gestionar publicaciones tipo blog implementada con **Arquitectura Hexagonal** y **Domain-Driven Design (DDD)**.

## 🏗️ Arquitectura

### Estructura del Proyecto

```
src/
├── domain/                    # Capa de Dominio (DDD)
│   ├── entities/             # Agregados y Entidades
│   │   └── Post.js          # Agregado principal
│   ├── value-objects/        # Objetos de Valor
│   │   ├── Author.js
│   │   ├── Tag.js
│   │   └── Image.js
│   └── repositories/         # Interfaces de Repositorio
│       └── PostRepository.js
├── application/              # Capa de Aplicación
│   └── use-cases/           # Casos de Uso
│       ├── CreatePostUseCase.js
│       ├── GetPostsUseCase.js
│       ├── GetPostByIdUseCase.js
│       └── SearchPostsUseCase.js
├── infrastructure/           # Capa de Infraestructura
│   ├── database/
│   │   └── mongodb/
│   │       ├── connection.js
│   │       ├── PostMongoRepository.js
│   │       └── models/
│   │           └── PostModel.js
│   └── file-upload/
│       └── FileUploadService.js
└── interfaces/              # Capa de Interfaces
    ├── controllers/
    │   └── PostController.js
    ├── routes/
    │   └── postRoutes.js
    └── middleware/
        ├── validation.js
        └── errorHandler.js
```

### Principios DDD Implementados

- **Agregados**: `Post` como agregado principal
- **Entidades**: `Post` con identidad única
- **Objetos de Valor**: `Author`, `Tag`, `Image` (inmutables)
- **Repositorios**: Abstracción para persistencia
- **Casos de Uso**: Lógica de aplicación encapsulada

## 🚀 Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd foro-service
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp env.example .env
```

Editar `.env` con tus configuraciones:
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/foro-service
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
```

4. **Iniciar MongoDB**
```bash
# Asegúrate de tener MongoDB corriendo
mongod
```

5. **Ejecutar la aplicación**
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## 📚 API Endpoints

### Documentación Interactiva

La API incluye documentación interactiva generada automáticamente con Swagger:

- **Swagger UI**: http://localhost:3000/s4/api-docs
- **Swagger JSON**: http://localhost:3000/s4/swagger.json

### Posts

#### Crear Post
```http
POST /s4/api/posts
Content-Type: multipart/form-data

{
  "title": "Mi primer post",
  "body": "Contenido del post...",
  "authors": "[{\"id\":\"1\",\"name\":\"Juan Pérez\",\"email\":\"juan@example.com\"}]",
  "tags": "[{\"value\":\"tecnología\",\"color\":\"#007bff\"}]",
  "images": [archivos]
}
```

#### Obtener Posts (con paginación)
```http
GET /s4/api/posts?page=1&limit=10&authorId=1&tag=tecnología
```

#### Obtener Post por ID
```http
GET /s4/api/posts/:id
```

#### Buscar Posts
```http
GET /s4/api/posts/search?q=tecnología&page=1&limit=10
```

#### Posts por Autor
```http
GET /s4/api/posts/author/:authorId?page=1&limit=10
```

#### Posts por Tag
```http
GET /s4/api/posts/tag/:tag?page=1&limit=10
```

#### Subir Imágenes
```http
POST /s4/api/posts/upload
Content-Type: multipart/form-data

{
  "images": [archivos]
}
```

### Health Check
```http
GET /s4/health
```

### Documentación
```http
GET /s4/api-docs
GET /s4/swagger.json
```

## 📊 Respuestas de la API

### Formato de Respuesta Exitosa
```json
{
  "success": true,
  "message": "Operación exitosa",
  "data": {
    // Datos de la respuesta
  }
}
```

### Formato de Respuesta con Paginación
```json
{
  "success": true,
  "data": {
    "posts": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10,
      "hasNextPage": true,
      "hasPrevPage": false,
      "nextPage": 2,
      "prevPage": null
    }
  }
}
```

### Formato de Error
```json
{
  "success": false,
  "message": "Descripción del error"
}
```

## 🗄️ Modelo de Datos

### Post (Agregado Principal)
```javascript
{
  id: "uuid",
  title: "Título del post",
  body: "Contenido del post",
  authors: [Author],
  tags: [Tag],
  images: [Image],
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z"
}
```

### Author (Objeto de Valor)
```javascript
{
  id: "string",
  name: "Nombre del autor",
  email: "email@example.com",
  avatar: "url-avatar"
}
```

### Tag (Objeto de Valor)
```javascript
{
  value: "tecnología",
  color: "#007bff"
}
```

### Image (Objeto de Valor)
```javascript
{
  id: "uuid",
  filename: "nombre-archivo.jpg",
  originalName: "imagen-original.jpg",
  mimeType: "image/jpeg",
  size: 1024000,
  url: "http://localhost:3000/uploads/nombre-archivo.jpg",
  alt: "Descripción de la imagen"
}
```

## 🔧 Configuración

### Variables de Entorno

| Variable | Descripción | Valor por Defecto |
|----------|-------------|-------------------|
| `PORT` | Puerto del servidor | `3000` |
| `NODE_ENV` | Entorno de ejecución | `development` |
| `MONGODB_URI` | URI de conexión MongoDB | `mongodb://localhost:27017/foro-service` |
| `UPLOAD_PATH` | Directorio de uploads | `./uploads` |
| `MAX_FILE_SIZE` | Tamaño máximo de archivo (bytes) | `5242880` (5MB) |
| `RATE_LIMIT_WINDOW_MS` | Ventana de rate limiting | `900000` (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Máximo de requests por ventana | `100` |

### Límites y Restricciones

- **Tamaño máximo de archivo**: 5MB
- **Tipos de archivo permitidos**: JPEG, PNG, GIF, WebP
- **Máximo archivos por request**: 10
- **Límite de paginación**: 1-100 elementos por página
- **Rate limiting**: 100 requests por 15 minutos

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Ejecutar tests en modo watch
npm run test:watch
```

## 📦 Scripts Disponibles

```bash
npm start          # Iniciar en producción
npm run dev        # Iniciar en desarrollo con nodemon
npm test           # Ejecutar tests
npm run lint       # Ejecutar linter
npm run docs:validate  # Validar documentación Swagger
npm run docs:generate  # Generar documentación
```

## 🏛️ Patrones de Diseño

### Arquitectura Hexagonal
- **Dominio**: Lógica de negocio pura
- **Aplicación**: Casos de uso y orquestación
- **Infraestructura**: Implementaciones concretas (MongoDB, File System)
- **Interfaces**: Controllers y rutas HTTP

### Domain-Driven Design
- **Agregados**: Post como unidad de consistencia
- **Objetos de Valor**: Author, Tag, Image (inmutables)
- **Repositorios**: Abstracción de persistencia
- **Casos de Uso**: Lógica de aplicación

### Patrones Adicionales
- **Repository Pattern**: Abstracción de acceso a datos
- **Use Case Pattern**: Encapsulación de lógica de aplicación
- **Value Object Pattern**: Objetos inmutables
- **Factory Pattern**: Creación de entidades

## 🔒 Seguridad

- **Helmet**: Headers de seguridad HTTP
- **CORS**: Configuración de origen cruzado
- **Rate Limiting**: Protección contra spam
- **Validación**: Validación de entrada con Joi
- **Sanitización**: Limpieza de datos de entrada

## 📚 Documentación

### Swagger/OpenAPI

La API incluye documentación automática generada con Swagger:

- **Interfaz Interactiva**: `/api-docs` - Documentación visual con pruebas interactivas
- **Especificación JSON**: `/swagger.json` - Especificación OpenAPI 3.0
- **Esquemas Completos**: Todos los modelos de datos documentados
- **Ejemplos de Uso**: Ejemplos de requests y responses
- **Validación en Tiempo Real**: Prueba endpoints directamente desde la documentación

### Características de la Documentación

- ✅ **OpenAPI 3.0** compatible
- ✅ **Esquemas detallados** para todos los modelos
- ✅ **Ejemplos de requests** y responses
- ✅ **Validación automática** de parámetros
- ✅ **Interfaz interactiva** para pruebas
- ✅ **Documentación de errores** y códigos de estado

## 📈 Monitoreo

- **Health Check**: `/health` endpoint
- **Logs**: Logging estructurado
- **Error Handling**: Manejo centralizado de errores
- **Database Status**: Estado de conexión MongoDB

## 🚀 Despliegue

### Docker (Recomendado)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Variables de Producción
```env
NODE_ENV=production
MONGODB_URI=mongodb://your-production-db:27017/foro-service
ALLOWED_ORIGINS=https://yourdomain.com
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🆘 Soporte

Si tienes problemas o preguntas:

1. Revisa la documentación
2. Consulta la [Guía de Swagger](docs/SWAGGER_GUIDE.md)
3. Busca en los issues existentes
4. Crea un nuevo issue con detalles del problema

---

**Desarrollado con ❤️ usando Arquitectura Hexagonal y DDD** # post_service
