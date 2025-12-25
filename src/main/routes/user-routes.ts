import { FastifyInstance } from 'fastify'

import { adaptRoute } from '@/main/adapters/fastify-route-adapter'
import { adaptMiddleware } from '@/main/adapters/fastify-middleware-adapter'
import { makeAddUserController } from '@/main/factories/add-user-controller-factory'
import { makeAuthMiddleware, makeLibrarianOrAdmin, makeAdminOnly } from '@/main/factories/middlewares'
import { makeLoadUsersController } from '@/main/factories/load-users-controller-factory'
import { makeUpdateUserController } from '@/main/factories/update-user-controller-factory'
import { makeDeleteUserController } from '@/main/factories/delete-user-controller-factory'

const userSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    email: { type: 'string' },
    role: { type: 'string', enum: ['admin', 'librarian', 'user'] }
  }
}

const addUserSchema = {
  tags: ['Users'],
  summary: 'Create a new user',
  description: 'Creates a new user in the system. Requires librarian or admin role.',
  security: [{ bearerAuth: [] }],
  body: {
    type: 'object',
    required: ['name', 'email', 'cpf', 'birthDate'],
    properties: {
      name: { type: 'string', description: 'User full name' },
      email: { type: 'string', format: 'email', description: 'User email address' },
      rg: { type: 'string', description: 'User RG document' },
      cpf: { type: 'string', description: 'User CPF document' },
      birthDate: { type: 'string', format: 'date', description: 'User birth date (YYYY-MM-DD)' }
    }
  },
  response: {
    200: userSchema,
    400: { type: 'object', properties: { error: { type: 'string' } } },
    403: { type: 'object', properties: { error: { type: 'string' } } }
  }
}

const loadUsersSchema = {
  tags: ['Users'],
  summary: 'List all users',
  description: 'Returns a list of all users. Requires librarian or admin role.',
  security: [{ bearerAuth: [] }],
  response: {
    200: {
      type: 'array',
      items: userSchema
    },
    403: { type: 'object', properties: { error: { type: 'string' } } }
  }
}

const updateUserSchema = {
  tags: ['Users'],
  summary: 'Update a user',
  description: 'Updates an existing user. Requires admin role.',
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    properties: {
      id: { type: 'string', description: 'User ID' }
    }
  },
  body: {
    type: 'object',
    properties: {
      name: { type: 'string', description: 'User full name' },
      email: { type: 'string', format: 'email', description: 'User email address' },
      role: { type: 'string', enum: ['admin', 'librarian', 'user'], description: 'User role' }
    }
  },
  response: {
    200: userSchema,
    400: { type: 'object', properties: { error: { type: 'string' } } },
    403: { type: 'object', properties: { error: { type: 'string' } } },
    404: { type: 'object', properties: { error: { type: 'string' } } }
  }
}

const deleteUserSchema = {
  tags: ['Users'],
  summary: 'Delete a user',
  description: 'Deletes a user from the system. Requires admin role.',
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    properties: {
      id: { type: 'string', description: 'User ID' }
    }
  },
  response: {
    204: { type: 'null', description: 'User deleted successfully' },
    403: { type: 'object', properties: { error: { type: 'string' } } },
    404: { type: 'object', properties: { error: { type: 'string' } } }
  }
}

export default (router: FastifyInstance): void => {
  router.post('/users', {
    schema: addUserSchema,
    preHandler: [
      adaptMiddleware(makeAuthMiddleware()),
      adaptMiddleware(makeLibrarianOrAdmin())
    ]
  }, adaptRoute(makeAddUserController()))

  router.get('/users', {
    schema: loadUsersSchema,
    preHandler: [
      adaptMiddleware(makeAuthMiddleware()),
      adaptMiddleware(makeLibrarianOrAdmin())
    ]
  }, adaptRoute(makeLoadUsersController()))

  router.put('/users/:id', {
    schema: updateUserSchema,
    preHandler: [
      adaptMiddleware(makeAuthMiddleware()),
      adaptMiddleware(makeAdminOnly())
    ]
  }, adaptRoute(makeUpdateUserController()))

  router.delete('/users/:id', {
    schema: deleteUserSchema,
    preHandler: [
      adaptMiddleware(makeAuthMiddleware()),
      adaptMiddleware(makeAdminOnly())
    ]
  }, adaptRoute(makeDeleteUserController()))
}
