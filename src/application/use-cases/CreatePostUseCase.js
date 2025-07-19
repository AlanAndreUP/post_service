const Post = require('../../domain/entities/Post');
const Author = require('../../domain/value-objects/Author');
const Tag = require('../../domain/value-objects/Tag');
const Image = require('../../domain/value-objects/Image');

class CreatePostUseCase {
  constructor(postRepository) {
    this.postRepository = postRepository;
  }

  async execute(postData) {
    // Validar datos de entrada
    this.validateInput(postData);

    // Crear objetos de valor
    const authors = postData.authors.map(authorData => 
      new Author(authorData.id, authorData.name, authorData.email, authorData.avatar)
    );

    const tags = postData.tags.map(tagData => 
      new Tag(tagData.value, tagData.color)
    );

    const images = postData.images.map(imageData => 
      new Image(
        imageData.id,
        imageData.filename,
        imageData.originalName,
        imageData.mimeType,
        imageData.size,
        imageData.url,
        imageData.alt
      )
    );

    // Crear el agregado Post
    const post = new Post(
      null, // El ID se generará automáticamente
      postData.title,
      postData.body,
      authors,
      tags,
      images
    );

    // Validar el agregado
    if (!post.isValid()) {
      throw new Error('Los datos del post no son válidos');
    }

    // Guardar en el repositorio
    const savedPost = await this.postRepository.save(post);
    return savedPost;
  }

  validateInput(postData) {
    if (!postData.title || postData.title.trim().length === 0) {
      throw new Error('El título es requerido');
    }

    if (!postData.body || postData.body.trim().length === 0) {
      throw new Error('El cuerpo del post es requerido');
    }

    if (!postData.authors || postData.authors.length === 0) {
      throw new Error('Al menos un autor es requerido');
    }

    // Validar autores
    postData.authors.forEach(author => {
      if (!author.id || !author.name || !author.email) {
        throw new Error('Datos de autor incompletos');
      }
    });

    // Validar tags si existen
    if (postData.tags) {
      postData.tags.forEach(tag => {
        if (!tag.value || tag.value.trim().length === 0) {
          throw new Error('Valor de tag requerido');
        }
      });
    }

    // Validar imágenes si existen
    if (postData.images) {
      postData.images.forEach(image => {
        if (!image.filename || !image.url) {
          throw new Error('Datos de imagen incompletos');
        }
      });
    }
  }
}

module.exports = CreatePostUseCase; 