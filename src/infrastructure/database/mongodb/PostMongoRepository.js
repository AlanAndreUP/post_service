const PostRepository = require('../../../domain/repositories/PostRepository');
const Post = require('../../../domain/entities/Post');
const Author = require('../../../domain/value-objects/Author');
const Tag = require('../../../domain/value-objects/Tag');
const Image = require('../../../domain/value-objects/Image');
const PostModel = require('./models/PostModel');

class PostMongoRepository extends PostRepository {
  async save(post) {
    try {
      const postData = post.toJSON();
      
      // Si el post ya existe (tiene un mongoId), actualizarlo
      if (post.mongoId) {
        const updatedPost = await PostModel.findByIdAndUpdate(
          post.mongoId,
          postData,
          { new: true, runValidators: true }
        );
        
        if (!updatedPost) {
          throw new Error('Post no encontrado para actualizar');
        }
        
        return Post.fromJSON(updatedPost.toObject());
      }
      
      // Si es un nuevo post, mantener el id (UUID) en el campo id y dejar que MongoDB genere el _id
      
      const newPost = new PostModel(postData);
      const savedPost = await newPost.save();
      
      return Post.fromJSON(savedPost.toObject());
    } catch (error) {
      throw new Error(`Error al guardar el post: ${error.message}`);
    }
  }

  async findById(id, includeDeleted = false) {
    try {
      // Verificar si el ID es un ObjectId válido
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);
      
      let post = null;
      
      if (isValidObjectId) {
        // Si es un ObjectId válido, buscar por _id
        const query = includeDeleted ? { includeDeleted: true } : {};
        post = await PostModel.findById(id).where(query);
      }
      
      // Si no se encuentra o no es un ObjectId válido, buscar por el campo id personalizado (UUID)
      if (!post) {
        const uuidQuery = { id };
        if (!includeDeleted) {
          uuidQuery.deletedAt = null;
        }
        post = await PostModel.findOne(uuidQuery);
      }
      
      return post ? Post.fromJSON(post.toObject()) : null;
    } catch (error) {
      throw new Error(`Error al buscar el post: ${error.message}`);
    }
  }

  async findAll(page = 1, limit = 10, filters = {}) {
    try {
      const skip = (page - 1) * limit;
      
      // Construir filtros
      const query = {};
      
      if (filters.authorId) {
        query['authors.id'] = filters.authorId;
      }
      
      if (filters.tag) {
        query['tags.value'] = { $regex: filters.tag, $options: 'i' };
      }
      
      if (filters.dateFrom) {
        query.createdAt = { $gte: new Date(filters.dateFrom) };
      }
      
      if (filters.dateTo) {
        if (query.createdAt) {
          query.createdAt.$lte = new Date(filters.dateTo);
        } else {
          query.createdAt = { $lte: new Date(filters.dateTo) };
        }
      }

      const posts = await PostModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      return posts.map(post => Post.fromJSON(post.toObject()));
    } catch (error) {
      throw new Error(`Error al obtener posts: ${error.message}`);
    }
  }

  async findByAuthor(authorId, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      
      const posts = await PostModel
        .find({ 'authors.id': authorId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      return posts.map(post => Post.fromJSON(post.toObject()));
    } catch (error) {
      throw new Error(`Error al buscar posts por autor: ${error.message}`);
    }
  }

  async findByTag(tag, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      
      const posts = await PostModel
        .find({ 'tags.value': { $regex: tag, $options: 'i' } })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      return posts.map(post => Post.fromJSON(post.toObject()));
    } catch (error) {
      throw new Error(`Error al buscar posts por tag: ${error.message}`);
    }
  }

  async search(query, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      
      const posts = await PostModel
        .find({
          $or: [
            { title: { $regex: query, $options: 'i' } },
            { body: { $regex: query, $options: 'i' } },
            { 'tags.value': { $regex: query, $options: 'i' } }
          ]
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      return posts.map(post => Post.fromJSON(post.toObject()));
    } catch (error) {
      throw new Error(`Error al buscar posts: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      const result = await PostModel.findByIdAndDelete(id);
      return result !== null;
    } catch (error) {
      throw new Error(`Error al eliminar el post: ${error.message}`);
    }
  }

  async softDelete(id) {
    try {
      const post = await PostModel.softDelete(id);
      return post ? Post.fromJSON(post.toObject()) : null;
    } catch (error) {
      throw new Error(`Error al eliminar suavemente el post: ${error.message}`);
    }
  }

  async restore(id) {
    try {
      const post = await PostModel.restore(id);
      return post ? Post.fromJSON(post.toObject()) : null;
    } catch (error) {
      throw new Error(`Error al restaurar el post: ${error.message}`);
    }
  }

  async findDeleted(page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      
      const posts = await PostModel
        .findDeleted()
        .sort({ deletedAt: -1 })
        .skip(skip)
        .limit(limit);

      return posts.map(post => Post.fromJSON(post.toObject()));
    } catch (error) {
      throw new Error(`Error al obtener posts eliminados: ${error.message}`);
    }
  }

  async count(filters = {}) {
    try {
      const query = {};
      
      if (filters.authorId) {
        query['authors.id'] = filters.authorId;
      }
      
      if (filters.tag) {
        query['tags.value'] = { $regex: filters.tag, $options: 'i' };
      }
      
      if (filters.search) {
        query.$or = [
          { title: { $regex: filters.search, $options: 'i' } },
          { body: { $regex: filters.search, $options: 'i' } },
          { 'tags.value': { $regex: filters.search, $options: 'i' } }
        ];
      }
      
      if (filters.dateFrom) {
        query.createdAt = { $gte: new Date(filters.dateFrom) };
      }
      
      if (filters.dateTo) {
        if (query.createdAt) {
          query.createdAt.$lte = new Date(filters.dateTo);
        } else {
          query.createdAt = { $lte: new Date(filters.dateTo) };
        }
      }

      // Manejar filtro de posts eliminados
      if (filters.deleted === true) {
        query.deletedAt = { $ne: null };
      } else if (filters.deleted === false) {
        query.deletedAt = null;
      }

      return await PostModel.countDocuments(query);
    } catch (error) {
      throw new Error(`Error al contar posts: ${error.message}`);
    }
  }
}

module.exports = PostMongoRepository; 