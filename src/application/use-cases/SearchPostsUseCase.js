class SearchPostsUseCase {
  constructor(postRepository) {
    this.postRepository = postRepository;
  }

  async execute(query, page = 1, limit = 10) {
    // Validar parámetros
    this.validateSearchParams(query, page, limit);

    // Normalizar parámetros
    const normalizedQuery = query.trim();
    const normalizedPage = Math.max(1, parseInt(page));
    const normalizedLimit = Math.min(100, Math.max(1, parseInt(limit)));

    // Realizar búsqueda
    const posts = await this.postRepository.search(normalizedQuery, normalizedPage, normalizedLimit);
    
    // Obtener total de resultados
    const total = await this.postRepository.count({ search: normalizedQuery });
    
    // Calcular información de paginación
    const totalPages = Math.ceil(total / normalizedLimit);
    const hasNextPage = normalizedPage < totalPages;
    const hasPrevPage = normalizedPage > 1;

    return {
      posts,
      query: normalizedQuery,
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

  validateSearchParams(query, page, limit) {
    if (!query || query.trim().length === 0) {
      throw new Error('Query de búsqueda requerida');
    }

    if (query.trim().length < 2) {
      throw new Error('La búsqueda debe tener al menos 2 caracteres');
    }

    if (page && (isNaN(page) || page < 1)) {
      throw new Error('El número de página debe ser un número positivo');
    }

    if (limit && (isNaN(limit) || limit < 1 || limit > 100)) {
      throw new Error('El límite debe ser un número entre 1 y 100');
    }
  }
}

module.exports = SearchPostsUseCase; 