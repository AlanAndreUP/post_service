const swaggerOptions = {
  // Personalización de la interfaz
  customCss: `
    .swagger-ui .topbar { 
      display: none 
    }
    .swagger-ui .info .title {
      color: #2c3e50;
      font-size: 36px;
      font-weight: 600;
    }
    .swagger-ui .info .description {
      font-size: 16px;
      line-height: 1.6;
    }
    .swagger-ui .scheme-container {
      background: #f8f9fa;
      border-radius: 4px;
      padding: 10px;
    }
    .swagger-ui .opblock.opblock-get .opblock-summary-method {
      background: #61affe;
    }
    .swagger-ui .opblock.opblock-post .opblock-summary-method {
      background: #49cc90;
    }
    .swagger-ui .opblock.opblock-put .opblock-summary-method {
      background: #fca130;
    }
    .swagger-ui .opblock.opblock-delete .opblock-summary-method {
      background: #f93e3e;
    }
    .swagger-ui .btn.execute {
      background-color: #4990e2;
      border-color: #4990e2;
    }
    .swagger-ui .btn.execute:hover {
      background-color: #357abd;
      border-color: #357abd;
    }
  `,
  
  // Configuración del sitio
  customSiteTitle: 'Foro Service API - Documentación',
  customfavIcon: '/favicon.ico',
  
  // Opciones de Swagger UI
  swaggerOptions: {
    // Expandir todos los endpoints por defecto
    docExpansion: 'list',
    
    // Mostrar filtro de búsqueda
    filter: true,
    
    // Mostrar headers de request
    showRequestHeaders: true,
    
    // Habilitar "Try it out" por defecto
    tryItOutEnabled: true,
    
    // Configuración de request interceptor
    requestInterceptor: (request) => {
      // Agregar headers por defecto si es necesario
      if (!request.headers) {
        request.headers = {};
      }
      
      // Agregar Content-Type para requests JSON
      if (request.body && typeof request.body === 'object') {
        request.headers['Content-Type'] = 'application/json';
      }
      
      return request;
    },
    
    // Configuración de response interceptor
    responseInterceptor: (response) => {
      // Log de responses para debugging
      console.log('Swagger Response:', {
        url: response.url,
        status: response.status,
        statusText: response.statusText
      });
      
      return response;
    },
    
    // Configuración de validación
    validatorUrl: null, // Deshabilitar validación externa
    
    // Configuración de persistencia
    persistAuthorization: true,
    
    // Configuración de layout
    layout: 'BaseLayout',
    
    // Configuración de deep linking
    deepLinking: true,
    
    // Configuración de display
    displayOperationId: false,
    displayRequestDuration: true,
    
    // Configuración de syntax highlighting
    syntaxHighlight: {
      activated: true,
      theme: 'monokai'
    }
  },
  
  // Configuración de explorador
  explorer: true,
  
  // Configuración de custom JS
  customJs: [
    // Aquí puedes agregar JavaScript personalizado si es necesario
  ],
  
  // Configuración de custom CSS adicional
  customCssUrl: [
    // Aquí puedes agregar URLs de CSS adicionales si es necesario
  ]
};

module.exports = swaggerOptions; 