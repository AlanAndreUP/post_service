// Middleware para manejo de errores
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Error de validación de Multer
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'El archivo excede el tamaño máximo permitido'
    });
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({
      success: false,
      message: 'Demasiados archivos. Máximo 10 archivos permitidos'
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      message: 'Campo de archivo inesperado'
    });
  }

  // Error de tipo de archivo no permitido
  if (err.message && err.message.includes('Tipo de archivo no permitido')) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  // Error de validación de Joi
  if (err.isJoi) {
    return res.status(400).json({
      success: false,
      message: err.details[0].message
    });
  }

  // Error de MongoDB
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(error => error.message);
    return res.status(400).json({
      success: false,
      message: messages.join(', ')
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'ID inválido'
    });
  }

  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'El registro ya existe'
    });
  }

  // Error de conexión a MongoDB
  if (err.name === 'MongoNetworkError') {
    return res.status(503).json({
      success: false,
      message: 'Error de conexión a la base de datos'
    });
  }

  // Error por defecto
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Error interno del servidor' 
      : err.message
  });
};

// Middleware para manejar rutas no encontradas
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta ${req.originalUrl} no encontrada`
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
}; 