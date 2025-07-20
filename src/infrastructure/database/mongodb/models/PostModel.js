const mongoose = require('mongoose');

// Schema para Author (objeto de valor)
const AuthorSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true
  },
  avatar: {
    type: String,
    default: null
  }
}, { _id: false });

// Schema para Tag (objeto de valor)
const TagSchema = new mongoose.Schema({
  value: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  color: {
    type: String,
    default: '#007bff'
  }
}, { _id: false });

// Schema para Image (objeto de valor)
const ImageSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  alt: {
    type: String,
    default: ''
  }
}, { _id: false });

// Schema principal para Post
const PostSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  body: {
    type: String,
    required: true,
    trim: true
  },
  authors: {
    type: [AuthorSchema],
    required: true,
    validate: {
      validator(authors) {
        return authors && authors.length > 0;
      },
      message: 'Al menos un autor es requerido'
    }
  },
  tags: {
    type: [TagSchema],
    default: []
  },
  images: {
    type: [ImageSchema],
    default: []
  },
  deletedAt: {
    type: Date,
    default: null,
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para mejorar el rendimiento
PostSchema.index({ title: 'text', body: 'text', 'tags.value': 'text' });
PostSchema.index({ 'authors.id': 1 });
PostSchema.index({ createdAt: -1 });
PostSchema.index({ 'tags.value': 1 });

// Métodos estáticos
PostSchema.statics.findByAuthor = function(authorId) {
  return this.find({ 'authors.id': authorId });
};

PostSchema.statics.findByTag = function(tag) {
  return this.find({ 'tags.value': { $regex: tag, $options: 'i' } });
};

PostSchema.statics.softDelete = function(id) {
  return this.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true });
};

PostSchema.statics.restore = function(id) {
  return this.findByIdAndUpdate(id, { deletedAt: null }, { new: true });
};

PostSchema.statics.findDeleted = function() {
  return this.find({ deletedAt: { $ne: null } });
};

PostSchema.statics.findWithDeleted = function() {
  return this.find().where({ includeDeleted: true });
};

// Métodos de instancia
PostSchema.methods.addAuthor = function(author) {
  if (!this.authors.find(a => a.id === author.id)) {
    this.authors.push(author);
  }
  return this;
};

PostSchema.methods.removeAuthor = function(authorId) {
  this.authors = this.authors.filter(a => a.id !== authorId);
  return this;
};

PostSchema.methods.addTag = function(tag) {
  if (!this.tags.find(t => t.value === tag.value)) {
    this.tags.push(tag);
  }
  return this;
};

PostSchema.methods.removeTag = function(tagValue) {
  this.tags = this.tags.filter(t => t.value !== tagValue);
  return this;
};

// Middleware pre-save para validaciones adicionales
PostSchema.pre('save', function(next) {
  // Validar que el título no esté vacío
  if (!this.title || this.title.trim().length === 0) {
    return next(new Error('El título no puede estar vacío'));
  }

  // Validar que el cuerpo no esté vacío
  if (!this.body || this.body.trim().length === 0) {
    return next(new Error('El cuerpo del post no puede estar vacío'));
  }

  // Validar que haya al menos un autor
  if (!this.authors || this.authors.length === 0) {
    return next(new Error('Al menos un autor es requerido'));
  }

  next();
});

// Middleware para filtrar automáticamente posts eliminados
PostSchema.pre(/^find/, function(next) {
  // Solo aplicar el filtro si no se está buscando específicamente posts eliminados
  if (!this.getQuery().includeDeleted) {
    this.where({ deletedAt: null });
  }
  next();
});

const PostModel = mongoose.model('Post', PostSchema);

module.exports = PostModel; 