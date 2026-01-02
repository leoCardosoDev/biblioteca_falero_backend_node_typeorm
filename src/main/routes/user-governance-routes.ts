
import { adaptRoute } from '@/main/adapters/fastify-route-adapter'
import { adaptMiddleware } from '@/main/adapters/fastify-middleware-adapter'
import { makeUpdateUserStatusController, makeUpdateUserRoleController } from '@/main/factories/controllers/user/user-governance-controller-factory'
import { makeAuthMiddleware, makeAdminOnly, makeLibrarianOrAdmin } from '@/main/factories/middlewares'

import { FastifyInstance } from 'fastify'

export default async (fastify: FastifyInstance): Promise<void> => {
  fastify.patch('/users/:id/status', {
    preHandler: [
      adaptMiddleware(makeAuthMiddleware()),
      adaptMiddleware(makeLibrarianOrAdmin())
    ]
  }, adaptRoute(makeUpdateUserStatusController()))

  fastify.patch('/users/:id/role', {
    preHandler: [
      adaptMiddleware(makeAuthMiddleware()),
      adaptMiddleware(makeAdminOnly())
    ]
  }, adaptRoute(makeUpdateUserRoleController()))
}
