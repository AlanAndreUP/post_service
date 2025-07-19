const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

class FileUploadService {
  constructor(uploadPath = './uploads', maxFileSize = 5 * 1024 * 1024) {
    this.uploadPath = uploadPath;
    this.maxFileSize = maxFileSize;
    this.initializeUploadDirectory();
  }

  async initializeUploadDirectory() {
    try {
      await fs.mkdir(this.uploadPath, { recursive: true });
      console.log(`📁 Directorio de uploads creado: ${this.uploadPath}`);
    } catch (error) {
      console.error('Error al crear directorio de uploads:', error);
    }
  }

  getStorage() {
    return multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, this.uploadPath);
      },
      filename: (req, file, cb) => {
        // Generar nombre único para el archivo
        const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
      }
    });
  }

  getFileFilter() {
    return (req, file, cb) => {
      // Validar tipo de archivo
      const allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp'
      ];

      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Tipo de archivo no permitido. Solo se permiten imágenes (JPEG, PNG, GIF, WebP)'), false);
      }
    };
  }

  getMulterConfig() {
    return {
      storage: this.getStorage(),
      fileFilter: this.getFileFilter(),
      limits: {
        fileSize: this.maxFileSize,
        files: 10 // Máximo 10 archivos por request
      }
    };
  }

  createUploadMiddleware() {
    return multer(this.getMulterConfig());
  }

  async saveFileInfo(file, baseUrl) {
    const fileInfo = {
      id: uuidv4(),
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url: `${baseUrl}/uploads/${file.filename}`,
      alt: ''
    };

    return fileInfo;
  }

  async deleteFile(filename) {
    try {
      const filePath = path.join(this.uploadPath, filename);
      await fs.unlink(filePath);
      console.log(`🗑️ Archivo eliminado: ${filename}`);
      return true;
    } catch (error) {
      console.error(`Error al eliminar archivo ${filename}:`, error);
      return false;
    }
  }

  async getFileStats(filename) {
    try {
      const filePath = path.join(this.uploadPath, filename);
      const stats = await fs.stat(filePath);
      return stats;
    } catch (error) {
      console.error(`Error al obtener estadísticas del archivo ${filename}:`, error);
      return null;
    }
  }

  validateFile(file) {
    const errors = [];

    // Validar tamaño
    if (file.size > this.maxFileSize) {
      errors.push(`El archivo ${file.originalname} excede el tamaño máximo permitido`);
    }

    // Validar tipo MIME
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp'
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      errors.push(`El archivo ${file.originalname} tiene un tipo no permitido`);
    }

    return errors;
  }

  getUploadPath() {
    return this.uploadPath;
  }

  setUploadPath(newPath) {
    this.uploadPath = newPath;
    this.initializeUploadDirectory();
  }

  setMaxFileSize(newSize) {
    this.maxFileSize = newSize;
  }
}

module.exports = FileUploadService; 