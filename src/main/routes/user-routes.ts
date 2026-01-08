import { FastifyInstance } from 'fastify'

import { adaptRoute } from '@/main/adapters/fastify-route-adapter'
import { adaptMiddleware } from '@/main/adapters/fastify-middleware-adapter'
import { errorSchema } from '@/main/config/error-schema'
import { makeAddUserController } from '@/main/factories/add-user-controller-factory'
import { makeAuthMiddleware, makeLibrarianOrAdmin, makeAdminOnly } from '@/main/factories/middlewares'
import { makeLoadUsersController } from '@/main/factories/load-users-controller-factory'
import { makeLoadUserByIdController } from '@/main/factories/load-user-by-id-controller-factory'
import { makeUpdateUserController } from '@/main/factories/update-user-controller-factory'
import { makeDeleteUserController } from '@/main/factories/delete-user-controller-factory'

const userSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    email: { type: 'string' },
    rg: { type: 'string' },
    cpf: { type: 'string' },
    gender: { type: 'string' },
    phone: { type: 'string' },
    status: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'BLOCKED'] },
    version: { type: 'integer' },
    createdAt: { type: 'string', format: 'date-time' },
    login: {
      type: 'object',
      properties: {
        role: { type: 'string' },
        status: { type: 'string' }
      },
      nullable: true
    },
    address: {
      type: 'object',
      properties: {
        street: { type: 'string' },
        number: { type: 'string' },
        complement: { type: 'string' },
        neighborhoodId: { type: 'string' },
        cityId: { type: 'string' },
        zipCode: { type: 'string' }
      },
      nullable: true
    }
  }
}

const addUserSchema = {
  tags: ['Users'],
  summary: 'Create a new user',
  description: 'Creates a new user in the system. Requires librarian or admin role.',
  security: [{ bearerAuth: [] }],
  body: {
    type: 'object',
    required: ['name', 'email', 'cpf', 'gender'],
    properties: {
      name: { type: 'string', description: 'User full name' },
      email: { type: 'string', format: 'email', description: 'User email address' },
      rg: { type: 'string', description: 'User RG document' },
      cpf: { type: 'string', description: 'User CPF document' },
      gender: { type: 'string', description: 'User gender' },
      phone: { type: 'string', description: 'User phone number' },
      address: {
        type: 'object',
        properties: {
          street: { type: 'string' },
          number: { type: 'string' },
          complement: { type: 'string' },
          neighborhood: { type: 'string' },
          city: { type: 'string' },
          state: { type: 'string' },
          zipCode: { type: 'string' },
          neighborhoodId: { type: 'string' },
          cityId: { type: 'string' }
        }
      }
    }
  },
  response: {
    200: userSchema,
    400: errorSchema,
    403: errorSchema
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
    403: errorSchema
  }
}

const loadUserByIdSchema = {
  tags: ['Users'],
  summary: 'Load user by id',
  description: 'Returns a user by id. Requires librarian or admin role.',
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    properties: {
      id: { type: 'string', description: 'Target User ID (UUID)' }
    }
  },
  response: {
    200: {
      ...userSchema,
      properties: {
        ...userSchema.properties,
        cpf: { type: 'string' },
        rg: { type: 'string' },
        gender: { type: 'string' },
        phone: { type: 'string' },
        address: {
          type: 'object',
          properties: {
            street: { type: 'string' },
            number: { type: 'string' },
            complement: { type: 'string' },
            neighborhoodId: { type: 'string' },
            cityId: { type: 'string' },
            zipCode: { type: 'string' }
          }
        }
      }
    },
    403: errorSchema,
    404: errorSchema
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
      id: { type: 'string', description: 'Target User ID (UUID)' }
    }
  },
  body: {
    type: 'object',
    properties: {
      name: { type: 'string', description: 'User full name' },
      email: { type: 'string', format: 'email', description: 'User email address' },
      role: { type: 'string', enum: ['admin', 'librarian', 'user'], description: 'User role' },
      gender: { type: 'string', description: 'User gender' },
      phone: { type: 'string', description: 'User phone number' }
    }
  },
  response: {
    200: userSchema,
    400: errorSchema,
    403: errorSchema,
    404: errorSchema
  }
}

const deleteUserSchema = {
  tags: ['Users'],
  summary: 'Delete a user',
  description: 'Deletes a user from the system. Requires admin role. This endpoint performs a Soft Delete.',
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    properties: {
      id: { type: 'string', description: 'Target User ID (UUID)' }
    }
  },
  response: {
    204: { type: 'null', description: 'User deleted successfully' },
    403: errorSchema,
    404: errorSchema
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

  router.get('/users/:id', {
    schema: loadUserByIdSchema,
    preHandler: [
      adaptMiddleware(makeAuthMiddleware()),
      adaptMiddleware(makeLibrarianOrAdmin())
    ]
  }, adaptRoute(makeLoadUserByIdController()))

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
