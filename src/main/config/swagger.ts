import { FastifyDynamicSwaggerOptions } from '@fastify/swagger'

export const swaggerConfig: FastifyDynamicSwaggerOptions = {
  openapi: {
    info: {
      title: 'Biblioteca API',
      description: 'API documentation for the Biblioteca backend system',
      version: '1.0.0'
    },
    servers: [
      {
        url: 'http://localhost:{port}',
        description: 'Development server',
        variables: {
          port: {
            default: '5050'
          }
        }
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Users', description: 'User management endpoints' },
      { name: 'User Login', description: 'User login creation endpoints' }
    ]
  }
}
