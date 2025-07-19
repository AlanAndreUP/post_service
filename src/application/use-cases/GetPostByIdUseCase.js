class GetPostByIdUseCase {
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

    return post;
  }

  validateId(id) {
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      throw new Error('ID de post requerido');
    }
  }
}

module.exports = GetPostByIdUseCase; 