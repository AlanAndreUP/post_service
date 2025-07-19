const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Foro Service API',
      version: '1.0.0',
      description: 'API RESTful para crear y gestionar publicaciones tipo blog implementada con Arquitectura Hexagonal y Domain-Driven Design (DDD)',
      contact: {
        name: 'API Support',
        email: 'support@foro-service.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desarrollo'
      },
      {
        url: 'https://api.foro-service.com',
        description: 'Servidor de producción'
      }
    ],
    components: {
      schemas: {
        Post: {
          type: 'object',
          required: ['title', 'body', 'authors'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'ID único del post'
            },
            title: {
              type: 'string',
              maxLength: 200,
              description: 'Título del post'
            },
            body: {
              type: 'string',
              description: 'Contenido del post'
            },
            authors: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Author'
              },
              description: 'Lista de autores del post'
            },
            tags: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Tag'
              },
              description: 'Lista de tags del post'
            },
            images: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Image'
              },
              description: 'Lista de imágenes del post'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de última actualización'
            }
          }
        },
        Author: {
          type: 'object',
          required: ['id', 'name', 'email'],
          properties: {
            id: {
              type: 'string',
              description: 'ID único del autor'
            },
            name: {
              type: 'string',
              description: 'Nombre del autor'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email del autor'
            },
            avatar: {
              type: 'string',
              format: 'uri',
              description: 'URL del avatar del autor'
            }
          }
        },
        Tag: {
          type: 'object',
          required: ['value'],
          properties: {
            value: {
              type: 'string',
              maxLength: 50,
              description: 'Valor del tag'
            },
            color: {
              type: 'string',
              pattern: '^#[0-9A-Fa-f]{6}$',
              description: 'Color del tag en formato hexadecimal'
            }
          }
        },
        Image: {
          type: 'object',
          required: ['id', 'filename', 'originalName', 'mimeType', 'size', 'url'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'ID único de la imagen'
            },
            filename: {
              type: 'string',
              description: 'Nombre del archivo guardado'
            },
            originalName: {
              type: 'string',
              description: 'Nombre original del archivo'
            },
            mimeType: {
              type: 'string',
              enum: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
              description: 'Tipo MIME de la imagen'
            },
            size: {
              type: 'integer',
              minimum: 1,
              description: 'Tamaño del archivo en bytes'
            },
            url: {
              type: 'string',
              format: 'uri',
              description: 'URL de acceso a la imagen'
            },
            alt: {
              type: 'string',
              description: 'Texto alternativo de la imagen'
            }
          }
        },
        Pagination: {
          type: 'object',
          properties: {
            page: {
              type: 'integer',
              minimum: 1,
              description: 'Página actual'
            },
            limit: {
              type: 'integer',
              minimum: 1,
              maximum: 100,
              description: 'Número de elementos por página'
            },
            total: {
              type: 'integer',
              minimum: 0,
              description: 'Total de elementos'
            },
            totalPages: {
              type: 'integer',
              minimum: 0,
              description: 'Total de páginas'
            },
            hasNextPage: {
              type: 'boolean',
              description: 'Indica si hay página siguiente'
            },
            hasPrevPage: {
              type: 'boolean',
              description: 'Indica si hay página anterior'
            },
            nextPage: {
              type: 'integer',
              nullable: true,
              description: 'Número de la página siguiente'
            },
            prevPage: {
              type: 'integer',
              nullable: true,
              description: 'Número de la página anterior'
            }
          }
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Indica si la operación fue exitosa'
            },
            message: {
              type: 'string',
              description: 'Mensaje descriptivo'
            },
            data: {
              description: 'Datos de la respuesta'
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              description: 'Descripción del error'
            }
          }
        }
      },
      parameters: {
        page: {
          name: 'page',
          in: 'query',
          description: 'Número de página',
          required: false,
          schema: {
            type: 'integer',
            minimum: 1,
            default: 1
          }
        },
        limit: {
          name: 'limit',
          in: 'query',
          description: 'Número de elementos por página',
          required: false,
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 10
          }
        },
        authorId: {
          name: 'authorId',
          in: 'query',
          description: 'ID del autor para filtrar',
          required: false,
          schema: {
            type: 'string'
          }
        },
        tag: {
          name: 'tag',
          in: 'query',
          description: 'Tag para filtrar',
          required: false,
          schema: {
            type: 'string'
          }
        },
        dateFrom: {
          name: 'dateFrom',
          in: 'query',
          description: 'Fecha de inicio para filtrar (YYYY-MM-DD)',
          required: false,
          schema: {
            type: 'string',
            format: 'date'
          }
        },
        dateTo: {
          name: 'dateTo',
          in: 'query',
          description: 'Fecha de fin para filtrar (YYYY-MM-DD)',
          required: false,
          schema: {
            type: 'string',
            format: 'date'
          }
        },
        query: {
          name: 'q',
          in: 'query',
          description: 'Término de búsqueda',
          required: true,
          schema: {
            type: 'string',
            minLength: 2
          }
        },
        postId: {
          name: 'id',
          in: 'path',
          description: 'ID del post',
          required: true,
          schema: {
            type: 'string',
            format: 'uuid'
          }
        }
      }
    }
  },
  apis: [
    './src/interfaces/routes/*.js',
    './src/interfaces/controllers/*.js'
  ]
};

const specs = swaggerJsdoc(options);

module.exports = specs; 