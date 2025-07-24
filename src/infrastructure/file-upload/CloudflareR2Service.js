const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

class CloudflareR2Service {
  constructor() {
    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
      },
    });
    
    this.bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;
    this.publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL;
    
    // Configurar multer para almacenamiento temporal
    this.storage = multer.diskStorage({
      destination: (req, file, cb) => {
        const uploadDir = './uploads/temp';
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
      }
    });
    
    this.upload = multer({
      storage: this.storage,
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
        files: 10
      },
      fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
          return cb(null, true);
        } else {
          cb(new Error('Solo se permiten archivos de imagen (JPEG, PNG, GIF, WebP)'));
        }
      }
    });
  }

  // Crear middleware de subida
  createUploadMiddleware() {
    return this.upload;
  }

  // Subir archivo a R2
  async uploadFile(file) {
    try {
      const fileExtension = path.extname(file.originalname);
      const fileName = `${uuidv4()}-${Date.now()}${fileExtension}`;
      const key = `posts/${fileName}`;

      const fileBuffer = fs.readFileSync(file.path);

      const uploadParams = {
        Bucket: this.bucketName,
        Key: key,
        Body: fileBuffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
        Metadata: {
          originalName: file.originalname,
          uploadedAt: new Date().toISOString()
        }
      };

      const command = new PutObjectCommand(uploadParams);
      await this.s3Client.send(command);

      // Limpiar archivo temporal
      fs.unlinkSync(file.path);

      return {
        id: uuidv4(),
        filename: fileName,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url: `${this.publicUrl}/${key}`,
        alt: file.originalname,
        key
      };
    } catch (error) {
      // Limpiar archivo temporal en caso de error
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw new Error(`Error al subir archivo a R2: ${error.message}`);
    }
  }

  // Eliminar archivo de R2
  async deleteFile(key) {
    try {
      const deleteParams = {
        Bucket: this.bucketName,
        Key: key
      };

      const command = new DeleteObjectCommand(deleteParams);
      await this.s3Client.send(command);
      
      return true;
    } catch (error) {
      throw new Error(`Error al eliminar archivo de R2: ${error.message}`);
    }
  }

  // Generar URL firmada temporal (si es necesario)
  async generateSignedUrl(key, expiresIn = 3600) {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key
      });

      const signedUrl = await getSignedUrl(this.s3Client, command, { expiresIn });
      return signedUrl;
    } catch (error) {
      throw new Error(`Error al generar URL firmada: ${error.message}`);
    }
  }

  // Subir múltiples archivos
  async uploadMultipleFiles(files) {
    const uploadPromises = files.map(file => this.uploadFile(file));
    return Promise.all(uploadPromises);
  }

  // Validar configuración
  validateConfig() {
    const requiredEnvVars = [
      'CLOUDFLARE_R2_ENDPOINT',
      'CLOUDFLARE_R2_ACCESS_KEY_ID',
      'CLOUDFLARE_R2_SECRET_ACCESS_KEY',
      'CLOUDFLARE_R2_BUCKET_NAME',
      'CLOUDFLARE_R2_PUBLIC_URL'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      throw new Error(`Variables de entorno faltantes para Cloudflare R2: ${missingVars.join(', ')}`);
    }
  }

  // Obtener información del archivo
  getFileInfo(file) {
    return {
      id: uuidv4(),
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url: file.url || '',
      alt: file.originalname,
      key: file.key || ''
    };
  }
}

module.exports = CloudflareR2Service; 