const Joi = require('joi');

// Esquema de validación para crear post
const createPostSchema = Joi.object({
  title: Joi.string().required().min(1).max(200).messages({
    'string.empty': 'El título es requerido',
    'string.min': 'El título debe tener al menos 1 carácter',
    'string.max': 'El título no puede exceder 200 caracteres'
  }),
  body: Joi.string().required().min(1).messages({
    'string.empty': 'El cuerpo del post es requerido',
    'string.min': 'El cuerpo del post debe tener al menos 1 carácter'
  }),
  authors: Joi.string().required().messages({
    'string.empty': 'Los autores son requeridos'
  }),
  tags: Joi.string().optional().default('[]')
});

// Esquema de validación para paginación
const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(10),
  authorId: Joi.string().optional(),
  tag: Joi.string().optional(),
  dateFrom: Joi.date().iso().optional(),
  dateTo: Joi.date().iso().optional(),
  q: Joi.string().optional() // Para búsquedas
});

// Esquema de validación para búsqueda
const searchSchema = Joi.object({
  q: Joi.string().required().min(2).messages({
    'string.empty': 'Query de búsqueda requerida',
    'string.min': 'La búsqueda debe tener al menos 2 caracteres'
  }),
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(10)
});

// Middleware para validar creación de post
const validateCreatePost = (req, res, next) => {
  try {
    const { error, value } = createPostSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    // Validar que authors sea un JSON válido
    try {
      const authors = JSON.parse(value.authors);
      if (!Array.isArray(authors) || authors.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Al menos un autor es requerido'
        });
      }

      // Validar cada autor
      for (const author of authors) {
        if (!author.id || !author.name || !author.email) {
          return res.status(400).json({
            success: false,
            message: 'Datos de autor incompletos'
          });
        }
      }
    } catch (parseError) {
      return res.status(400).json({
        success: false,
        message: 'Formato de autores inválido'
      });
    }

    // Validar tags si existen
    try {
      const tags = JSON.parse(value.tags || '[]');
      if (!Array.isArray(tags)) {
        return res.status(400).json({
          success: false,
          message: 'Formato de tags inválido'
        });
      }

      for (const tag of tags) {
        if (!tag.value || tag.value.trim().length === 0) {
          return res.status(400).json({
            success: false,
            message: 'Valor de tag requerido'
          });
        }
      }
    } catch (parseError) {
      return res.status(400).json({
        success: false,
        message: 'Formato de tags inválido'
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error en validación'
    });
  }
};

// Middleware para validar parámetros de paginación
const validatePagination = (req, res, next) => {
  try {
    const { error } = paginationSchema.validate(req.query);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error en validación de paginación'
    });
  }
};

// Middleware para validar búsqueda
const validateSearch = (req, res, next) => {
  try {
    const { error } = searchSchema.validate(req.query);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error en validación de búsqueda'
    });
  }
};

// Middleware para validar ID
const validateId = (req, res, next) => {
  const { id } = req.params;
  
  if (!id || typeof id !== 'string' || id.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'ID requerido'
    });
  }

  next();
};

module.exports = {
  validateCreatePost,
  validatePagination,
  validateSearch,
  validateId
}; 