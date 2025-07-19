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
      
      // Si el post ya existe, actualizarlo
      if (post.id) {
        const updatedPost = await PostModel.findByIdAndUpdate(
          post.id,
          postData,
          { new: true, runValidators: true }
        );
        
        if (!updatedPost) {
          throw new Error('Post no encontrado para actualizar');
        }
        
        return Post.fromJSON(updatedPost.toObject());
      }
      
      // Si es un nuevo post, crearlo
      const newPost = new PostModel(postData);
      const savedPost = await newPost.save();
      
      return Post.fromJSON(savedPost.toObject());
    } catch (error) {
      throw new Error(`Error al guardar el post: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      const post = await PostModel.findById(id);
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

      return await PostModel.countDocuments(query);
    } catch (error) {
      throw new Error(`Error al contar posts: ${error.message}`);
    }
  }
}

module.exports = PostMongoRepository; 