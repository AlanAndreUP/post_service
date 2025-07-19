const express = require('express');
const PostController = require('../controllers/PostController');
const FileUploadService = require('../../infrastructure/file-upload/FileUploadService');
const { validateCreatePost, validatePagination } = require('../middleware/validation');

const router = express.Router();

// Inicializar servicios
const fileUploadService = new FileUploadService();

// Middleware de subida de archivos
const upload = fileUploadService.createUploadMiddleware();

/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: Crear un nuevo post
 *     description: Crea un nuevo post con título, cuerpo, autores, tags e imágenes opcionales
 *     tags: [Posts]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - body
 *               - authors
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 200
 *                 description: Título del post
 *                 example: "Mi primer post sobre tecnología"
 *               body:
 *                 type: string
 *                 description: Contenido del post
 *                 example: "Este es el contenido de mi primer post..."
 *               authors:
 *                 type: string
 *                 description: JSON string con array de autores
 *                 example: '[{"id":"1","name":"Juan Pérez","email":"juan@example.com"}]'
 *               tags:
 *                 type: string
 *                 description: JSON string con array de tags (opcional)
 *                 example: '[{"value":"tecnología","color":"#007bff"}]'
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Imágenes del post (máximo 10)
 *     responses:
 *       201:
 *         description: Post creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "Post creado exitosamente"
 *               data:
 *                 $ref: '#/components/schemas/Post'
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', upload.array('images', 10), validateCreatePost, async (req, res) => {
  const postController = new PostController(req.app.locals.postRepository);
  await postController.createPost(req, res);
});

/**
 * @swagger
 * /api/posts:
 *   get:
 *     summary: Obtener posts con paginación
 *     description: Obtiene una lista paginada de posts con filtros opcionales
 *     tags: [Posts]
 *     parameters:
 *       - $ref: '#/components/parameters/page'
 *       - $ref: '#/components/parameters/limit'
 *       - $ref: '#/components/parameters/authorId'
 *       - $ref: '#/components/parameters/tag'
 *       - $ref: '#/components/parameters/dateFrom'
 *       - $ref: '#/components/parameters/dateTo'
 *     responses:
 *       200:
 *         description: Lista de posts obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     posts:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Post'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       400:
 *         description: Parámetros inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', validatePagination, async (req, res) => {
  const postController = new PostController(req.app.locals.postRepository);
  await postController.getPosts(req, res);
});

/**
 * @swagger
 * /api/posts/search:
 *   get:
 *     summary: Buscar posts
 *     description: Busca posts por título, cuerpo o tags
 *     tags: [Posts]
 *     parameters:
 *       - $ref: '#/components/parameters/query'
 *       - $ref: '#/components/parameters/page'
 *       - $ref: '#/components/parameters/limit'
 *     responses:
 *       200:
 *         description: Resultados de búsqueda obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     posts:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Post'
 *                     query:
 *                       type: string
 *                       description: Término de búsqueda utilizado
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       400:
 *         description: Query de búsqueda inválida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/search', validatePagination, async (req, res) => {
  const postController = new PostController(req.app.locals.postRepository);
  await postController.searchPosts(req, res);
});

/**
 * @swagger
 * /api/posts/author/{authorId}:
 *   get:
 *     summary: Obtener posts por autor
 *     description: Obtiene todos los posts de un autor específico
 *     tags: [Posts]
 *     parameters:
 *       - name: authorId
 *         in: path
 *         required: true
 *         description: ID del autor
 *         schema:
 *           type: string
 *       - $ref: '#/components/parameters/page'
 *       - $ref: '#/components/parameters/limit'
 *     responses:
 *       200:
 *         description: Posts del autor obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     posts:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Post'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       400:
 *         description: ID de autor inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/author/:authorId', validatePagination, async (req, res) => {
  const postController = new PostController(req.app.locals.postRepository);
  await postController.getPostsByAuthor(req, res);
});

/**
 * @swagger
 * /api/posts/tag/{tag}:
 *   get:
 *     summary: Obtener posts por tag
 *     description: Obtiene todos los posts que contengan un tag específico
 *     tags: [Posts]
 *     parameters:
 *       - name: tag
 *         in: path
 *         required: true
 *         description: Valor del tag
 *         schema:
 *           type: string
 *       - $ref: '#/components/parameters/page'
 *       - $ref: '#/components/parameters/limit'
 *     responses:
 *       200:
 *         description: Posts con el tag obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     posts:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Post'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       400:
 *         description: Tag inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/tag/:tag', validatePagination, async (req, res) => {
  const postController = new PostController(req.app.locals.postRepository);
  await postController.getPostsByTag(req, res);
});

/**
 * @swagger
 * /api/posts/{id}:
 *   get:
 *     summary: Obtener post por ID
 *     description: Obtiene un post específico por su ID
 *     tags: [Posts]
 *     parameters:
 *       - $ref: '#/components/parameters/postId'
 *     responses:
 *       200:
 *         description: Post obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Post'
 *       404:
 *         description: Post no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       400:
 *         description: ID inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', async (req, res) => {
  const postController = new PostController(req.app.locals.postRepository);
  await postController.getPostById(req, res);
});

/**
 * @swagger
 * /api/posts/upload:
 *   post:
 *     summary: Subir imágenes
 *     description: Sube imágenes independientemente y retorna información de los archivos
 *     tags: [Files]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Imágenes a subir (máximo 10)
 *     responses:
 *       200:
 *         description: Imágenes subidas exitosamente
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
 *                   example: "Archivos subidos exitosamente"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Image'
 *       400:
 *         description: Error en la subida de archivos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/upload', upload.array('images', 10), async (req, res) => {
  const postController = new PostController(req.app.locals.postRepository);
  await postController.uploadImages(req, res);
});

module.exports = router; 