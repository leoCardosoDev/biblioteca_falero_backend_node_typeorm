import { adaptRoute } from '@/main/adapters/fastify-route-adapter'
import { adaptMiddleware } from '@/main/adapters/fastify-middleware-adapter'
import { makeUpdateUserStatusController, makeUpdateUserRoleController } from '@/main/factories/controllers/user/user-governance-controller-factory'
import { makeAuthMiddleware, makeAdminOnly, makeLibrarianOrAdmin } from '@/main/factories/middlewares'
import { errorSchema } from '@/main/config/error-schema'

import { FastifyInstance } from 'fastify'

const updateUserStatusSchema = {
  tags: ['Users'],
  summary: 'Update user status',
  description: 'Blocks or activates a user. Requires librarian or admin role.',
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid', description: 'Target User ID (UUID)' }
    }
  },
  body: {
    type: 'object',
    required: ['status'],
    properties: {
      status: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'BLOCKED'] }
    }
  },
  response: {
    204: { type: 'null', description: 'Status updated successfully' },
    400: errorSchema,
    403: errorSchema
  }
}

const updateUserRoleSchema = {
  tags: ['Users'],
  summary: 'Update user role',
  description: 'Promotes or demotes a user. Requires admin role.',
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid', description: 'Target User ID (UUID)' }
    }
  },
  body: {
    type: 'object',
    required: ['roleId'],
    properties: {
      roleId: { type: 'string', format: 'uuid', description: 'New Role ID' }
    }
  },
  response: {
    204: { type: 'null', description: 'Role updated successfully' },
    400: errorSchema,
    403: errorSchema
  }
}

export default async (fastify: FastifyInstance): Promise<void> => {
  fastify.patch('/users/:id/status', {
    schema: updateUserStatusSchema,
    preHandler: [
      adaptMiddleware(makeAuthMiddleware()),
      adaptMiddleware(makeLibrarianOrAdmin())
    ]
  }, adaptRoute(makeUpdateUserStatusController()))

  fastify.patch('/users/:id/role', {
    schema: updateUserRoleSchema,
    preHandler: [
      adaptMiddleware(makeAuthMiddleware()),
      adaptMiddleware(makeAdminOnly())
    ]
  }, adaptRoute(makeUpdateUserRoleController()))
}
