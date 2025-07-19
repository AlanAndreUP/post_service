class GetPostsUseCase {
  constructor(postRepository) {
    this.postRepository = postRepository;
  }

  async execute(page = 1, limit = 10, filters = {}) {
    // Validar parámetros de paginación
    this.validatePaginationParams(page, limit);

    // Normalizar parámetros
    const normalizedPage = Math.max(1, parseInt(page));
    const normalizedLimit = Math.min(100, Math.max(1, parseInt(limit)));

    // Obtener posts paginados
    const posts = await this.postRepository.findAll(normalizedPage, normalizedLimit, filters);
    
    // Obtener total de posts para la paginación
    const total = await this.postRepository.count(filters);
    
    // Calcular información de paginación
    const totalPages = Math.ceil(total / normalizedLimit);
    const hasNextPage = normalizedPage < totalPages;
    const hasPrevPage = normalizedPage > 1;

    return {
      posts,
      pagination: {
        page: normalizedPage,
        limit: normalizedLimit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? normalizedPage + 1 : null,
        prevPage: hasPrevPage ? normalizedPage - 1 : null
      }
    };
  }

  validatePaginationParams(page, limit) {
    if (page && (isNaN(page) || page < 1)) {
      throw new Error('El número de página debe ser un número positivo');
    }

    if (limit && (isNaN(limit) || limit < 1 || limit > 100)) {
      throw new Error('El límite debe ser un número entre 1 y 100');
    }
  }
}

module.exports = GetPostsUseCase; 