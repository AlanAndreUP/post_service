class SoftDeletePostUseCase {
  constructor(postRepository) {
    this.postRepository = postRepository;
  }

  async execute(id) {
    // Validar ID
    this.validateId(id);

    // Buscar el post
    const post = await this.postRepository.findById(id);
    
    if (!post) {
      throw new Error('Post no encontrado');
    }

    if (post.isDeleted) {
      throw new Error('El post ya está eliminado');
    }

    // Realizar soft delete
    const deletedPost = await this.postRepository.softDelete(id);
    
    if (!deletedPost) {
      throw new Error('Error al eliminar el post');
    }

    return deletedPost;
  }

  validateId(id) {
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      throw new Error('ID de post requerido');
    }
  }
}

module.exports = SoftDeletePostUseCase; 