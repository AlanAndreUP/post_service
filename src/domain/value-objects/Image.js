const { v4: uuidv4 } = require('uuid');

class Image {
  constructor(id, filename, originalName, mimeType, size, url, alt) {
    this._id = id || uuidv4();
    this._filename = filename;
    this._originalName = originalName;
    this._mimeType = mimeType;
    this._size = size;
    this._url = url;
    this._alt = alt || '';
  }

  // Getters
  get id() { return this._id; }
  get filename() { return this._filename; }
  get originalName() { return this._originalName; }
  get mimeType() { return this._mimeType; }
  get size() { return this._size; }
  get url() { return this._url; }
  get alt() { return this._alt; }

  // Validación
  isValid() {
    const validMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    return this._filename && 
           this._originalName &&
           validMimeTypes.includes(this._mimeType) &&
           this._size > 0 &&
           this._url;
  }

  // Método para convertir a objeto plano
  toJSON() {
    return {
      id: this._id,
      filename: this._filename,
      originalName: this._originalName,
      mimeType: this._mimeType,
      size: this._size,
      url: this._url,
      alt: this._alt
    };
  }

  // Método estático para crear desde datos
  static fromJSON(data) {
    return new Image(
      data.id,
      data.filename,
      data.originalName,
      data.mimeType,
      data.size,
      data.url,
      data.alt
    );
  }

  // Método para comparar igualdad
  equals(other) {
    return other instanceof Image && this._id === other._id;
  }

  // Método para actualizar alt text
  updateAlt(alt) {
    this._alt = alt;
  }
}

module.exports = Image; 