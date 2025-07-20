const Post = require('../../domain/entities/Post');
const Author = require('../../domain/value-objects/Author');
const Tag = require('../../domain/value-objects/Tag');
const Image = require('../../domain/value-objects/Image');

class UpdatePostUseCase {
  constructor(postRepository) {
    this.postRepository = postRepository;
  }

  async execute(id, updateData) {
    // Validar ID
    this.validateId(id);

    // Buscar el post existente
    const existingPost = await this.postRepository.findById(id);
    
    if (!existingPost) {
      throw new Error('Post no encontrado');
    }

    if (existingPost.isDeleted) {
      throw new Error('No se puede editar un post eliminado');
    }

    // Validar datos de entrada
    this.validateInput(updateData);

    // Crear objetos de valor para los nuevos datos
    const authors = updateData.authors ? updateData.authors.map(authorData => 
      new Author(authorData.id, authorData.name, authorData.email, authorData.avatar)
    ) : existingPost.authors;

    const tags = updateData.tags ? updateData.tags.map(tagData => 
      new Tag(tagData.value, tagData.color)
    ) : existingPost.tags;

    const images = updateData.images ? updateData.images.map(imageData => 
      new Image(
        imageData.id,
        imageData.filename,
        imageData.originalName,
        imageData.mimeType,
        imageData.size,
        imageData.url,
        imageData.alt
      )
    ) : existingPost.images;

    // Crear el post actualizado
    const updatedPost = new Post(
      existingPost.id,
      updateData.title || existingPost.title,
      updateData.body || existingPost.body,
      authors,
      tags,
      images,
      existingPost.createdAt,
      new Date(), // updatedAt
      existingPost.mongoId,
      existingPost.deletedAt
    );

    // Validar el agregado
    if (!updatedPost.isValid()) {
      throw new Error('Los datos del post no son válidos');
    }

    // Guardar en el repositorio
    const savedPost = await this.postRepository.save(updatedPost);
    return savedPost;
  }

  validateId(id) {
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      throw new Error('ID de post requerido');
    }
  }

  validateInput(updateData) {
    // Validar título si se proporciona
    if (updateData.title !== undefined) {
      if (!updateData.title || updateData.title.trim().length === 0) {
        throw new Error('El título no puede estar vacío');
      }
      if (updateData.title.length > 200) {
        throw new Error('El título no puede exceder 200 caracteres');
      }
    }

    // Validar cuerpo si se proporciona
    if (updateData.body !== undefined) {
      if (!updateData.body || updateData.body.trim().length === 0) {
        throw new Error('El cuerpo del post no puede estar vacío');
      }
    }

    // Validar autores si se proporcionan
    if (updateData.authors) {
      if (!Array.isArray(updateData.authors) || updateData.authors.length === 0) {
        throw new Error('Al menos un autor es requerido');
      }

      updateData.authors.forEach(author => {
        if (!author.id || !author.name || !author.email) {
          throw new Error('Datos de autor incompletos');
        }
      });
    }

    // Validar tags si se proporcionan
    if (updateData.tags) {
      if (!Array.isArray(updateData.tags)) {
        throw new Error('Los tags deben ser un array');
      }

      updateData.tags.forEach(tag => {
        if (!tag.value || tag.value.trim().length === 0) {
          throw new Error('Valor de tag requerido');
        }
      });
    }

    // Validar imágenes si se proporcionan
    if (updateData.images) {
      if (!Array.isArray(updateData.images)) {
        throw new Error('Las imágenes deben ser un array');
      }

      updateData.images.forEach(image => {
        if (!image.filename || !image.url) {
          throw new Error('Datos de imagen incompletos');
        }
      });
    }
  }
}

module.exports = UpdatePostUseCase; 