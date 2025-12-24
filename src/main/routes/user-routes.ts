import { FastifyInstance } from 'fastify'

import { adaptRoute } from '@/main/adapters/fastify-route-adapter'
import { adaptMiddleware } from '@/main/adapters/fastify-middleware-adapter'
import { makeAddUserController } from '@/main/factories/add-user-controller-factory'
import { makeAuthMiddleware, makeLibrarianOrAdmin, makeAdminOnly } from '@/main/factories/middlewares'
import { makeLoadUsersController } from '@/main/factories/load-users-controller-factory'
import { makeUpdateUserController } from '@/main/factories/update-user-controller-factory'

export default (router: FastifyInstance): void => {
  router.post('/users', {
    preHandler: [
      adaptMiddleware(makeAuthMiddleware()),
      adaptMiddleware(makeLibrarianOrAdmin())
    ]
  }, adaptRoute(makeAddUserController()))

  router.get('/users', {
    preHandler: [
      adaptMiddleware(makeAuthMiddleware()),
      adaptMiddleware(makeLibrarianOrAdmin())
    ]
  }, adaptRoute(makeLoadUsersController()))

  router.put('/users/:id', {
    preHandler: [
      adaptMiddleware(makeAuthMiddleware()),
      adaptMiddleware(makeAdminOnly())
    ]
  }, adaptRoute(makeUpdateUserController()))
}
