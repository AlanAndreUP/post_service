const CreatePostUseCase = require('../../application/use-cases/CreatePostUseCase');
const GetPostsUseCase = require('../../application/use-cases/GetPostsUseCase');
const GetPostByIdUseCase = require('../../application/use-cases/GetPostByIdUseCase');
const SearchPostsUseCase = require('../../application/use-cases/SearchPostsUseCase');
const UpdatePostUseCase = require('../../application/use-cases/UpdatePostUseCase');
const SoftDeletePostUseCase = require('../../application/use-cases/SoftDeletePostUseCase');
const RestorePostUseCase = require('../../application/use-cases/RestorePostUseCase');
const GetDeletedPostsUseCase = require('../../application/use-cases/GetDeletedPostsUseCase');
const FileUploadService = require('../../infrastructure/file-upload/FileUploadService');

class PostController {
  constructor(postRepository) {
    this.createPostUseCase = new CreatePostUseCase(postRepository);
    this.getPostsUseCase = new GetPostsUseCase(postRepository);
    this.getPostByIdUseCase = new GetPostByIdUseCase(postRepository);
    this.searchPostsUseCase = new SearchPostsUseCase(postRepository);
    this.updatePostUseCase = new UpdatePostUseCase(postRepository);
    this.softDeletePostUseCase = new SoftDeletePostUseCase(postRepository);
    this.restorePostUseCase = new RestorePostUseCase(postRepository);
    this.getDeletedPostsUseCase = new GetDeletedPostsUseCase(postRepository);
    this.fileUploadService = new FileUploadService();
  }

  // POST /api/posts
  async createPost(req, res) {
    try {
      const { title, body, authors, tags } = req.body;
      
      // Procesar archivos subidos
      const images = [];
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          const fileInfo = await this.fileUploadService.saveFileInfo(file, `${req.protocol}://${req.get('host')}`);
          images.push(fileInfo);
        }
      }

      const postData = {
        title,
        body,
        authors: JSON.parse(authors || '[]'),
        tags: JSON.parse(tags || '[]'),
        images
      };

      const post = await this.createPostUseCase.execute(postData);

      res.status(201).json({
        success: true,
        message: 'Post creado exitosamente',
        data: post.toJSON()
      });

    } catch (error) {
      console.error('Error al crear post:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/posts
  async getPosts(req, res) {
    try {
      const { page = 1, limit = 10, authorId, tag, dateFrom, dateTo } = req.query;
      
      const filters = {};
      if (authorId) filters.authorId = authorId;
      if (tag) filters.tag = tag;
      if (dateFrom) filters.dateFrom = dateFrom;
      if (dateTo) filters.dateTo = dateTo;

      const result = await this.getPostsUseCase.execute(page, limit, filters);

      res.status(200).json({
        success: true,
        data: {
          posts: result.posts.map(post => post.toJSON()),
          pagination: result.pagination
        }
      });

    } catch (error) {
      console.error('Error al obtener posts:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/posts/:id
  async getPostById(req, res) {
    try {
      const { id } = req.params;
      const post = await this.getPostByIdUseCase.execute(id);

      res.status(200).json({
        success: true,
        data: post.toJSON()
      });

    } catch (error) {
      console.error('Error al obtener post:', error);
      
      if (error.message === 'Post no encontrado') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // PUT /api/posts/:id
  async updatePost(req, res) {
    try {
      const { id } = req.params;
      const { title, body, authors, tags } = req.body;
      
      // Procesar archivos subidos si existen
      let images = undefined;
      if (req.files && req.files.length > 0) {
        images = [];
        for (const file of req.files) {
          const fileInfo = await this.fileUploadService.saveFileInfo(file, `${req.protocol}://${req.get('host')}`);
          images.push(fileInfo);
        }
      }

      const updateData = {
        title,
        body,
        authors: authors ? JSON.parse(authors) : undefined,
        tags: tags ? JSON.parse(tags) : undefined,
        images
      };

      const post = await this.updatePostUseCase.execute(id, updateData);

      res.status(200).json({
        success: true,
        message: 'Post actualizado exitosamente',
        data: post.toJSON()
      });

    } catch (error) {
      console.error('Error al actualizar post:', error);
      
      if (error.message === 'Post no encontrado') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/posts/search
  async searchPosts(req, res) {
    try {
      const { q: query, page = 1, limit = 10 } = req.query;
      
      if (!query) {
        return res.status(400).json({
          success: false,
          message: 'Query de búsqueda requerida'
        });
      }

      const result = await this.searchPostsUseCase.execute(query, page, limit);

      res.status(200).json({
        success: true,
        data: {
          posts: result.posts.map(post => post.toJSON()),
          query: result.query,
          pagination: result.pagination
        }
      });

    } catch (error) {
      console.error('Error al buscar posts:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/posts/author/:authorId
  async getPostsByAuthor(req, res) {
    try {
      const { authorId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const result = await this.getPostsUseCase.execute(page, limit, { authorId });

      res.status(200).json({
        success: true,
        data: {
          posts: result.posts.map(post => post.toJSON()),
          pagination: result.pagination
        }
      });

    } catch (error) {
      console.error('Error al obtener posts por autor:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/posts/tag/:tag
  async getPostsByTag(req, res) {
    try {
      const { tag } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const result = await this.getPostsUseCase.execute(page, limit, { tag });

      res.status(200).json({
        success: true,
        data: {
          posts: result.posts.map(post => post.toJSON()),
          pagination: result.pagination
        }
      });

    } catch (error) {
      console.error('Error al obtener posts por tag:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // POST /api/posts/upload
  async uploadImages(req, res) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No se han subido archivos'
        });
      }

      const uploadedFiles = [];
      for (const file of req.files) {
        const fileInfo = await this.fileUploadService.saveFileInfo(file, `${req.protocol}://${req.get('host')}`);
        uploadedFiles.push(fileInfo);
      }

      res.status(200).json({
        success: true,
        message: 'Archivos subidos exitosamente',
        data: uploadedFiles
      });

    } catch (error) {
      console.error('Error al subir archivos:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // DELETE /api/posts/:id (Soft Delete)
  async softDeletePost(req, res) {
    try {
      const { id } = req.params;
      const post = await this.softDeletePostUseCase.execute(id);

      res.status(200).json({
        success: true,
        message: 'Post eliminado exitosamente',
        data: post.toJSON()
      });

    } catch (error) {
      console.error('Error al eliminar post:', error);
      
      if (error.message === 'Post no encontrado') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // POST /api/posts/:id/restore
  async restorePost(req, res) {
    try {
      const { id } = req.params;
      const post = await this.restorePostUseCase.execute(id);

      res.status(200).json({
        success: true,
        message: 'Post restaurado exitosamente',
        data: post.toJSON()
      });

    } catch (error) {
      console.error('Error al restaurar post:', error);
      
      if (error.message === 'Post no encontrado') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/posts/deleted
  async getDeletedPosts(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      
      const result = await this.getDeletedPostsUseCase.execute(page, limit);

      res.status(200).json({
        success: true,
        data: {
          posts: result.posts.map(post => post.toJSON()),
          pagination: result.pagination
        }
      });

    } catch (error) {
      console.error('Error al obtener posts eliminados:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = PostController; 