class Author {
  constructor(id, name, email, avatar) {
    this._id = id;
    this._name = name;
    this._email = email;
    this._avatar = avatar || null;
  }

  // Getters
  get id() { return this._id; }
  get name() { return this._name; }
  get email() { return this._email; }
  get avatar() { return this._avatar; }

  // Validación
  isValid() {
    return this._id && 
           this._name && 
           this._name.trim().length > 0 &&
           this._email && 
           this._email.includes('@');
  }

  // Método para convertir a objeto plano
  toJSON() {
    return {
      id: this._id,
      name: this._name,
      email: this._email,
      avatar: this._avatar
    };
  }

  // Método estático para crear desde datos
  static fromJSON(data) {
    return new Author(data.id, data.name, data.email, data.avatar);
  }

  // Método para comparar igualdad
  equals(other) {
    return other instanceof Author && this._id === other._id;
  }
}

module.exports = Author; 