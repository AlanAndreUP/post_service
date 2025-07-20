const { v4: uuidv4 } = require('uuid');
const Author = require('../value-objects/Author');
const Tag = require('../value-objects/Tag');
const Image = require('../value-objects/Image');

class Post {
  constructor(id, title, body, authors, tags, images, createdAt, updatedAt, mongoId) {
    this._id = id || uuidv4();
    this._title = title;
    this._body = body;
    this._authors = authors || [];
    this._tags = tags || [];
    this._images = images || [];
    this._createdAt = createdAt || new Date();
    this._updatedAt = updatedAt || new Date();
    this._mongoId = mongoId;
  }

  // Getters
  get id() { return this._id; }
  get mongoId() { return this._mongoId; }
  get title() { return this._title; }
  get body() { return this._body; }
  get authors() { return [...this._authors]; }
  get tags() { return [...this._tags]; }
  get images() { return [...this._images]; }
  get createdAt() { return this._createdAt; }
  get updatedAt() { return this._updatedAt; }

  // Métodos de dominio
  addAuthor(author) {
    if (!this._authors.find(a => a.id === author.id)) {
      this._authors.push(author);
      this._updatedAt = new Date();
    }
  }

  removeAuthor(authorId) {
    this._authors = this._authors.filter(a => a.id !== authorId);
    this._updatedAt = new Date();
  }

  addTag(tag) {
    if (!this._tags.find(t => t.value === tag.value)) {
      this._tags.push(tag);
      this._updatedAt = new Date();
    }
  }

  removeTag(tagValue) {
    this._tags = this._tags.filter(t => t.value !== tagValue);
    this._updatedAt = new Date();
  }

  addImage(image) {
    this._images.push(image);
    this._updatedAt = new Date();
  }

  removeImage(imageId) {
    this._images = this._images.filter(img => img.id !== imageId);
    this._updatedAt = new Date();
  }

  updateTitle(title) {
    this._title = title;
    this._updatedAt = new Date();
  }

  updateBody(body) {
    this._body = body;
    this._updatedAt = new Date();
  }

  // Método para validar el estado del agregado
  isValid() {
    return this._title && this._title.trim().length > 0 &&
           this._body && this._body.trim().length > 0 &&
           this._authors.length > 0;
  }

  // Método para convertir a objeto plano
  toJSON() {
    const result = {
      id: this._id,
      title: this._title,
      body: this._body,
      authors: this._authors.map(author => author.toJSON()),
      tags: this._tags.map(tag => tag.toJSON()),
      images: this._images.map(image => image.toJSON()),
      createdAt: this._createdAt,
      updatedAt: this._updatedAt
    };

    // Incluir _id si está disponible (para actualizaciones)
    if (this._mongoId) {
      result._id = this._mongoId;
    }

    return result;
  }

  // Método estático para crear desde datos
  static fromJSON(data) {
    return new Post(
      data.id,
      data.title,
      data.body,
      data.authors?.map(author => Author.fromJSON(author)) || [],
      data.tags?.map(tag => Tag.fromJSON(tag)) || [],
      data.images?.map(image => Image.fromJSON(image)) || [],
      data.createdAt ? new Date(data.createdAt) : undefined,
      data.updatedAt ? new Date(data.updatedAt) : undefined,
      data._id // MongoDB ObjectId
    );
  }
}

module.exports = Post; 