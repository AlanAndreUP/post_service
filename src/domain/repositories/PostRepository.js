class PostRepository {
  async save(post) {
    throw new Error('Método save debe ser implementado');
  }

  async findById(id) {
    throw new Error('Método findById debe ser implementado');
  }

  async findAll(page = 1, limit = 10, filters = {}) {
    throw new Error('Método findAll debe ser implementado');
  }

  async findByAuthor(authorId, page = 1, limit = 10) {
    throw new Error('Método findByAuthor debe ser implementado');
  }

  async findByTag(tag, page = 1, limit = 10) {
    throw new Error('Método findByTag debe ser implementado');
  }

  async search(query, page = 1, limit = 10) {
    throw new Error('Método search debe ser implementado');
  }

  async delete(id) {
    throw new Error('Método delete debe ser implementado');
  }

  async count(filters = {}) {
    throw new Error('Método count debe ser implementado');
  }
}

module.exports = PostRepository; 