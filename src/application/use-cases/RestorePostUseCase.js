class RestorePostUseCase {
  constructor(postRepository) {
    this.postRepository = postRepository;
  }

  async execute(id) {
    // Validar ID
    this.validateId(id);

    // Buscar el post (incluyendo eliminados)
    const post = await this.postRepository.findById(id, true);
    
    if (!post) {
      throw new Error('Post no encontrado');
    }

    if (!post.isDeleted) {
      throw new Error('El post no está eliminado');
    }

    // Restaurar el post
    const restoredPost = await this.postRepository.restore(id);
    
    if (!restoredPost) {
      throw new Error('Error al restaurar el post');
    }

    return restoredPost;
  }

  validateId(id) {
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      throw new Error('ID de post requerido');
    }
  }
}

module.exports = RestorePostUseCase; 