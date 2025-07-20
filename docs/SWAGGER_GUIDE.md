# Guía de Documentación Swagger

## 📖 Descripción General

Esta API utiliza **Swagger/OpenAPI 3.0** para generar documentación automática e interactiva. La documentación está disponible en tiempo real y se actualiza automáticamente con cualquier cambio en el código.

## 🚀 Acceso a la Documentación

### URLs de Documentación

- **Interfaz Interactiva**: http://localhost:3000/s4/api-docs
- **Especificación JSON**: http://localhost:3000/s4/swagger.json
- **Información de la API**: http://localhost:3000/s4/

### Características Principales

✅ **Documentación Automática**: Se genera automáticamente desde el código
✅ **Interfaz Interactiva**: Prueba endpoints directamente desde el navegador
✅ **Validación en Tiempo Real**: Valida parámetros y respuestas
✅ **Ejemplos de Uso**: Incluye ejemplos de requests y responses
✅ **Esquemas Completos**: Documentación detallada de todos los modelos

## 🔧 Cómo Usar Swagger UI

### 1. Navegación

1. **Abre** http://localhost:3000/s4/api-docs en tu navegador
2. **Explora** los endpoints organizados por tags:
   - **Posts**: Endpoints relacionados con posts
   - **Files**: Endpoints para subida de archivos
   - **System**: Endpoints del sistema (health check, info)

### 2. Probar Endpoints

1. **Selecciona** un endpoint que quieras probar
2. **Haz clic** en "Try it out"
3. **Completa** los parámetros requeridos
4. **Ejecuta** la petición con "Execute"
5. **Revisa** la respuesta y los códigos de estado

### 3. Parámetros de Entrada

#### Query Parameters
- **page**: Número de página (default: 1)
- **limit**: Elementos por página (1-100, default: 10)
- **authorId**: Filtrar por autor
- **tag**: Filtrar por tag
- **dateFrom/dateTo**: Filtrar por rango de fechas
- **q**: Término de búsqueda

#### Path Parameters
- **id**: ID del post (UUID)
- **authorId**: ID del autor
- **tag**: Valor del tag

#### Request Body
Para endpoints POST, el body puede incluir:
- **title**: Título del post (string, max 200 chars)
- **body**: Contenido del post (string)
- **authors**: Array de autores (JSON string)
- **tags**: Array de tags (JSON string, opcional)
- **images**: Archivos de imagen (multipart/form-data)

### 4. Códigos de Respuesta

- **200**: Operación exitosa
- **201**: Recurso creado exitosamente
- **400**: Error de validación o datos inválidos
- **404**: Recurso no encontrado
- **500**: Error interno del servidor

## 📋 Esquemas de Datos

### Post
```json
{
  "id": "uuid",
  "title": "string (max 200 chars)",
  "body": "string",
  "authors": [Author],
  "tags": [Tag],
  "images": [Image],
  "createdAt": "date-time",
  "updatedAt": "date-time"
}
```

### Author
```json
{
  "id": "string",
  "name": "string",
  "email": "email",
  "avatar": "uri (opcional)"
}
```

### Tag
```json
{
  "value": "string (max 50 chars)",
  "color": "hex-color (opcional)"
}
```

### Image
```json
{
  "id": "uuid",
  "filename": "string",
  "originalName": "string",
  "mimeType": "image/jpeg|image/png|image/gif|image/webp",
  "size": "integer",
  "url": "uri",
  "alt": "string (opcional)"
}
```

### Pagination
```json
{
  "page": "integer",
  "limit": "integer",
  "total": "integer",
  "totalPages": "integer",
  "hasNextPage": "boolean",
  "hasPrevPage": "boolean",
  "nextPage": "integer|null",
  "prevPage": "integer|null"
}
```

## 🛠️ Desarrollo y Mantenimiento

### Agregar Nuevos Endpoints

Para documentar un nuevo endpoint, agrega comentarios JSDoc:

```javascript
/**
 * @swagger
 * /api/nuevo-endpoint:
 *   get:
 *     summary: Descripción breve
 *     description: Descripción detallada
 *     tags: [TagName]
 *     parameters:
 *       - $ref: '#/components/parameters/parameterName'
 *     responses:
 *       200:
 *         description: Respuesta exitosa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SchemaName'
 */
```

### Agregar Nuevos Esquemas

En `swaggerConfig.js`, agrega nuevos esquemas:

```javascript
components: {
  schemas: {
    NuevoSchema: {
      type: 'object',
      properties: {
        // propiedades del esquema
      }
    }
  }
}
```

### Validación de Documentación

```bash
# Validar que la especificación sea correcta
npm run docs:validate

# Verificar que todos los endpoints estén documentados
npm run docs:generate
```

## 🔍 Troubleshooting

### Problemas Comunes

1. **Documentación no se actualiza**
   - Reinicia el servidor
   - Verifica que los comentarios JSDoc estén correctos

2. **Errores de validación**
   - Revisa la sintaxis de los esquemas
   - Verifica que las referencias a esquemas existan

3. **Endpoints no aparecen**
   - Asegúrate de que los archivos estén incluidos en `apis` en swaggerConfig.js
   - Verifica que los comentarios JSDoc estén en el formato correcto

### Logs de Debug

Para habilitar logs de debug de Swagger:

```javascript
// En swaggerOptions.js
swaggerOptions: {
  // ... otras opciones
  onComplete: () => {
    console.log('Swagger UI cargado correctamente');
  }
}
```

## 📚 Recursos Adicionales

- [OpenAPI 3.0 Specification](https://swagger.io/specification/)
- [Swagger JSDoc](https://github.com/Surnet/swagger-jsdoc)
- [Swagger UI Express](https://github.com/scottie1984/swagger-ui-express)
- [Swagger Editor](https://editor.swagger.io/)

## 🎯 Mejores Prácticas

1. **Documenta todo**: Cada endpoint debe tener documentación completa
2. **Usa ejemplos**: Incluye ejemplos realistas de requests y responses
3. **Valida esquemas**: Asegúrate de que los esquemas sean precisos
4. **Mantén actualizado**: Actualiza la documentación cuando cambies el código
5. **Prueba la documentación**: Usa Swagger UI para probar tus endpoints
6. **Usa tags**: Organiza endpoints con tags descriptivos
7. **Describe errores**: Documenta todos los códigos de error posibles

---

**¡La documentación Swagger hace que tu API sea más accesible y fácil de usar!** 