import { FastifyDynamicSwaggerOptions } from '@fastify/swagger'

export const swaggerConfig: FastifyDynamicSwaggerOptions = {
  openapi: {
    info: {
      title: 'Falero Library API',
      description: 'Documentação oficial da API do sistema de biblioteca Falero. Inclui suporte a Soft Delete, Estados Explícitos e Optimistic Locking.',
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
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        },
        Role: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            slug: { type: 'string', example: 'admin' },
            description: { type: 'string' },
            powerLevel: { type: 'integer', example: 100 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            rg: { type: 'string' },
            cpf: { type: 'string' },
            gender: { type: 'string' },
            phone: { type: 'string', nullable: true },
            status: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'BLOCKED'] },
            version: { type: 'integer', description: 'Optimistic Locking version' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            deletedAt: { type: 'string', format: 'date-time', nullable: true }
          }
        },
        Login: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            roleId: { type: 'string', format: 'uuid' },
            status: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            deletedAt: { type: 'string', format: 'date-time', nullable: true }
          }
        }
      }
    },
    tags: [
      { name: 'Auth', description: 'Authentication and Access Control' },
      { name: 'Users', description: 'User Identity Management' },
      { name: 'Roles', description: 'Role and Permission Management' }
    ]
  }
}
