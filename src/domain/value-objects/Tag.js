class Tag {
  constructor(value, color) {
    this._value = value;
    this._color = color || '#007bff';
  }

  // Getters
  get value() { return this._value; }
  get color() { return this._color; }

  // Validación
  isValid() {
    return this._value && 
           this._value.trim().length > 0 &&
           this._value.length <= 50;
  }

  // Método para convertir a objeto plano
  toJSON() {
    return {
      value: this._value,
      color: this._color
    };
  }

  // Método estático para crear desde datos
  static fromJSON(data) {
    return new Tag(data.value, data.color);
  }

  // Método para comparar igualdad
  equals(other) {
    return other instanceof Tag && this._value === other._value;
  }

  // Método para normalizar el valor del tag
  static normalize(value) {
    return value.toLowerCase().trim().replace(/\s+/g, '-');
  }
}

module.exports = Tag; 