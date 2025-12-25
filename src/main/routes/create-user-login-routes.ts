import { FastifyInstance } from 'fastify'

import { adaptRoute } from '@/main/adapters/fastify-route-adapter'
import { adaptMiddleware } from '@/main/adapters/fastify-middleware-adapter'
import { makeCreateUserLoginController } from '@/main/factories/create-user-login-controller-factory'
import { makeAuthMiddleware, makeLibrarianOrAdmin } from '@/main/factories/middlewares'

const createUserLoginSchema = {
  tags: ['User Login'],
  summary: 'Create login credentials for a user',
  description: 'Creates login credentials (username/password) for an existing user. Requires librarian or admin role.',
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    properties: {
      userId: { type: 'string', description: 'User ID' }
    }
  },
  body: {
    type: 'object',
    required: ['username', 'password'],
    properties: {
      username: { type: 'string', description: 'Login username' },
      password: { type: 'string', description: 'Login password (min 8 chars, requires uppercase, lowercase, number, special char)' }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        userId: { type: 'string' },
        username: { type: 'string' }
      }
    },
    400: { type: 'object', properties: { error: { type: 'string' } } },
    403: { type: 'object', properties: { error: { type: 'string' } } }
  }
}

export default (fastify: FastifyInstance): void => {
  fastify.post('/users/:userId/login', {
    schema: createUserLoginSchema,
    preHandler: [
      adaptMiddleware(makeAuthMiddleware()),
      adaptMiddleware(makeLibrarianOrAdmin())
    ]
  }, adaptRoute(makeCreateUserLoginController()))
}
