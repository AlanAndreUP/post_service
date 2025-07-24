# Configuración de Cloudflare R2

Esta guía te ayudará a configurar Cloudflare R2 para el almacenamiento de archivos en el microservicio de foro.

## 🚀 Pasos para Configurar Cloudflare R2

### 1. Crear una cuenta en Cloudflare
- Ve a [cloudflare.com](https://cloudflare.com)
- Crea una cuenta gratuita o inicia sesión

### 2. Habilitar R2 Storage
- En el dashboard de Cloudflare, ve a **R2 Object Storage**
- Haz clic en **Create bucket**
- Dale un nombre a tu bucket (ej: `foro-service-uploads`)
- Selecciona la región más cercana a tus usuarios

### 3. Crear API Tokens
- Ve a **My Profile** > **API Tokens**
- Haz clic en **Create Token**
- Selecciona **Custom token**
- Configura los permisos:
  - **Account** > **Cloudflare R2** > **Object Read & Write**
- Guarda el token y copia:
  - **Access Key ID**
  - **Secret Access Key**

### 4. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Configuración de Cloudflare R2
CLOUDFLARE_R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
CLOUDFLARE_R2_ACCESS_KEY_ID=your-access-key-id
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your-secret-access-key
CLOUDFLARE_R2_BUCKET_NAME=your-bucket-name
CLOUDFLARE_R2_PUBLIC_URL=https://your-public-domain.com
```

### 5. Configurar Dominio Público (Opcional)

Para tener URLs públicas para tus archivos:

1. **Opción A: Usar dominio personalizado**
   - Configura un dominio personalizado en R2
   - Usa ese dominio en `CLOUDFLARE_R2_PUBLIC_URL`

2. **Opción B: Usar URL de R2**
   - Usa la URL directa de R2: `https://your-account-id.r2.cloudflarestorage.com/your-bucket-name`

## 🔧 Configuración Detallada

### Variables de Entorno Explicadas

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `CLOUDFLARE_R2_ENDPOINT` | URL del endpoint de R2 | `https://1234567890.r2.cloudflarestorage.com` |
| `CLOUDFLARE_R2_ACCESS_KEY_ID` | ID de la clave de acceso | `abc123def456` |
| `CLOUDFLARE_R2_SECRET_ACCESS_KEY` | Clave secreta de acceso | `xyz789uvw012` |
| `CLOUDFLARE_R2_BUCKET_NAME` | Nombre del bucket | `foro-service-uploads` |
| `CLOUDFLARE_R2_PUBLIC_URL` | URL pública para acceder a archivos | `https://cdn.tudominio.com` |

### Estructura de Archivos en R2

Los archivos se organizan de la siguiente manera:

```
bucket-name/
├── posts/
│   ├── uuid-timestamp.jpg
│   ├── uuid-timestamp.png
│   └── uuid-timestamp.gif
└── temp/
    └── archivos-temporales/
```

## 🛡️ Configuración de Seguridad

### 1. Configurar CORS (Cross-Origin Resource Sharing)

Si necesitas acceder a los archivos desde un frontend:

```json
{
  "CORSRules": [
    {
      "AllowedOrigins": ["https://tudominio.com"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedHeaders": ["*"],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

### 2. Configurar Políticas de Bucket

- **Acceso público**: Para archivos que deben ser accesibles públicamente
- **Acceso privado**: Para archivos que requieren autenticación

## 📁 Características del Servicio

### Funcionalidades Implementadas

- ✅ **Subida de archivos**: Soporte para múltiples formatos (JPEG, PNG, GIF, WebP)
- ✅ **Límites de tamaño**: Máximo 5MB por archivo
- ✅ **Límites de cantidad**: Máximo 10 archivos por request
- ✅ **Nombres únicos**: Generación automática de nombres únicos
- ✅ **Limpieza automática**: Eliminación de archivos temporales
- ✅ **Metadatos**: Almacenamiento de información del archivo original
- ✅ **URLs públicas**: Acceso directo a los archivos

### Métodos Disponibles

```javascript
// Subir un archivo
const fileInfo = await r2Service.uploadFile(file);

// Subir múltiples archivos
const filesInfo = await r2Service.uploadMultipleFiles(files);

// Eliminar un archivo
await r2Service.deleteFile(key);

// Generar URL firmada
const signedUrl = await r2Service.generateSignedUrl(key, 3600);
```

## 🚨 Solución de Problemas

### Error: "Variables de entorno faltantes"
```
Error: Variables de entorno faltantes para Cloudflare R2: CLOUDFLARE_R2_ENDPOINT, CLOUDFLARE_R2_ACCESS_KEY_ID
```

**Solución**: Verifica que todas las variables de entorno estén configuradas en tu archivo `.env`.

### Error: "Access Denied"
```
Error: Error al subir archivo a R2: Access Denied
```

**Solución**: Verifica que las credenciales de API sean correctas y tengan los permisos necesarios.

### Error: "Bucket not found"
```
Error: Error al subir archivo a R2: The specified bucket does not exist
```

**Solución**: Verifica que el nombre del bucket en `CLOUDFLARE_R2_BUCKET_NAME` sea correcto.

## 💰 Costos

Cloudflare R2 ofrece un plan gratuito generoso:

- **Almacenamiento**: 10GB gratis
- **Operaciones de lectura**: 1,000,000 de operaciones gratis por mes
- **Operaciones de escritura**: 1,000,000 de operaciones gratis por mes
- **Transferencia de datos**: 10GB gratis por mes

## 🔄 Migración desde Almacenamiento Local

Si ya tienes archivos almacenados localmente:

1. **Subir archivos existentes**:
   ```bash
   # Script para migrar archivos existentes
   node scripts/migrate-to-r2.js
   ```

2. **Actualizar URLs en la base de datos**:
   ```javascript
   // Actualizar URLs de imágenes en posts existentes
   await PostModel.updateMany(
     { 'images.url': { $regex: /^\/uploads\// } },
     { $set: { 'images.url': newR2Url } }
   );
   ```

## 📚 Recursos Adicionales

- [Documentación oficial de Cloudflare R2](https://developers.cloudflare.com/r2/)
- [API Reference](https://developers.cloudflare.com/r2/api/)
- [Pricing](https://developers.cloudflare.com/r2/platform/pricing/)
- [Best Practices](https://developers.cloudflare.com/r2/platform/best-practices/) 