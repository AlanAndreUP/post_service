require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Infraestructura
const mongoDBConnection = require('./infrastructure/database/mongodb/connection');
const PostMongoRepository = require('./infrastructure/database/mongodb/PostMongoRepository');

// Interfaces
const postRoutes = require('./interfaces/routes/postRoutes');
const { errorHandler, notFoundHandler } = require('./interfaces/middleware/errorHandler');

// Swagger
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./infrastructure/swagger/swaggerConfig');
const swaggerOptions = require('./infrastructure/swagger/swaggerOptions');

class Application {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    this.postRepository = null;
  }

  async initialize() {
    try {
      console.log('🚀 Iniciando aplicación...');

      // Conectar a MongoDB
      await this.connectDatabase();

      // Inicializar repositorios
      this.initializeRepositories();

      // Configurar middleware
      this.setupMiddleware();

      // Configurar rutas
      this.setupRoutes();

      // Configurar manejo de errores
      this.setupErrorHandling();

      // Iniciar servidor
      await this.startServer();

    } catch (error) {
      console.error('❌ Error al inicializar la aplicación:', error);
      process.exit(1);
    }
  }

  async connectDatabase() {
    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/foro-service';
      await mongoDBConnection.connect(mongoUri);
    } catch (error) {
      console.error('❌ Error al conectar a MongoDB:', error);
      throw error;
    }
  }

  initializeRepositories() {
    // Inicializar repositorios y hacerlos disponibles globalmente
    this.postRepository = new PostMongoRepository();
    this.app.locals.postRepository = this.postRepository;
    
    console.log('✅ Repositorios inicializados');
  }

  setupMiddleware() {
    // Seguridad
    this.app.use(helmet());

    // CORS
    this.app.use(cors({
      origin: process.env.NODE_ENV === 'production' 
        ? process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000']
        : true,
      credentials: true
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // máximo 100 requests por ventana
      message: {
        success: false,
        message: 'Demasiadas peticiones desde esta IP, intenta de nuevo más tarde'
      }
    });
    this.app.use('/api/', limiter);

    // Parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Servir archivos estáticos
    this.app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

    console.log('✅ Middleware configurado');
  }

  setupRoutes() {
    // Health check
    /**
     * @swagger
     * /health:
     *   get:
     *     summary: Health check
     *     description: Verifica el estado de la API y la conexión a la base de datos
     *     tags: [System]
     *     responses:
     *       200:
     *         description: API funcionando correctamente
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 message:
     *                   type: string
     *                   example: "API funcionando correctamente"
     *                 timestamp:
     *                   type: string
     *                   format: date-time
     *                   description: Timestamp de la verificación
     *                 database:
     *                   type: object
     *                   properties:
     *                     connected:
     *                       type: boolean
     *                       description: Estado de conexión a MongoDB
     *                     readyState:
     *                       type: integer
     *                       description: Estado de preparación de MongoDB
     *       503:
     *         description: API no disponible
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     */
    this.app.get('/health', (req, res) => {
      const dbStatus = mongoDBConnection.getConnectionStatus();
      res.json({
        success: true,
        message: 'API funcionando correctamente',
        timestamp: new Date().toISOString(),
        database: {
          connected: dbStatus.isConnected,
          readyState: dbStatus.readyState
        }
      });
    });

    // Swagger documentation
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, swaggerOptions));

    // Swagger JSON endpoint
    this.app.get('/swagger.json', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(swaggerSpecs);
    });

    // API routes
    this.app.use('/api/posts', postRoutes);

    // Ruta raíz
    /**
     * @swagger
     * /:
     *   get:
     *     summary: Información de la API
     *     description: Obtiene información general sobre la API
     *     tags: [System]
     *     responses:
     *       200:
     *         description: Información de la API
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 message:
     *                   type: string
     *                   example: "API de Foro Service - Arquitectura Hexagonal DDD"
     *                 version:
     *                   type: string
     *                   example: "1.0.0"
     *                 endpoints:
     *                   type: object
     *                   properties:
     *                     health:
     *                       type: string
     *                       description: Endpoint de health check
     *                     posts:
     *                       type: string
     *                       description: Endpoint principal de posts
     *                     documentation:
     *                       type: string
     *                       description: Información sobre documentación
     */
    this.app.get('/', (req, res) => {
      res.json({
        success: true,
        message: 'API de Foro Service - Arquitectura Hexagonal DDD',
        version: '1.0.0',
        endpoints: {
          health: '/health',
          posts: '/api/posts',
          documentation: '/api-docs',
          swagger: '/swagger'
        }
      });
    });

    console.log('✅ Rutas configuradas');
  }

  setupErrorHandling() {
    // Middleware para manejar rutas no encontradas (debe ir antes del error handler)
    this.app.use(notFoundHandler);

    // Middleware para manejo de errores (debe ir al final)
    this.app.use(errorHandler);

    console.log('✅ Manejo de errores configurado');
  }

  async startServer() {
    return new Promise((resolve, reject) => {
      this.server = this.app.listen(this.port, () => {
        console.log(`✅ Servidor iniciado en puerto ${this.port}`);
        console.log(`🌐 API disponible en: http://localhost:${this.port}`);
        console.log(`📊 Health check: http://localhost:${this.port}/health`);
        console.log(`📝 Posts API: http://localhost:${this.port}/api/posts`);
        console.log(`📚 Documentación Swagger: http://localhost:${this.port}/api-docs`);
        resolve();
      });

      this.server.on('error', (error) => {
        console.error('❌ Error al iniciar servidor:', error);
        reject(error);
      });
    });
  }

  async shutdown() {
    console.log('🔄 Cerrando aplicación...');
    
    if (this.server) {
      this.server.close();
    }

    await mongoDBConnection.disconnect();
    console.log('✅ Aplicación cerrada correctamente');
  }
}

// Manejar señales de terminación
process.on('SIGTERM', async () => {
  console.log('📡 Recibida señal SIGTERM');
  await app.shutdown();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('📡 Recibida señal SIGINT');
  await app.shutdown();
  process.exit(0);
});

// Manejar errores no capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Error no capturado:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesa rechazada no manejada:', reason);
  process.exit(1);
});

// Inicializar aplicación
const app = new Application();
app.initialize().catch((error) => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});

module.exports = app; 