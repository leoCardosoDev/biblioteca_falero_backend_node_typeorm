import { FastifyInstance } from 'fastify'

import { adaptRoute } from '@/main/adapters/fastify-route-adapter'
import { adaptMiddleware } from '@/main/adapters/fastify-middleware-adapter'
import { makeAddUserController } from '@/main/factories/add-user-controller-factory'
import { makeAuthMiddleware, makeLibrarianOrAdmin } from '@/main/factories/middlewares'

export default (router: FastifyInstance): void => {
  router.post('/users', {
    preHandler: [
      adaptMiddleware(makeAuthMiddleware()),
      adaptMiddleware(makeLibrarianOrAdmin())
    ]
  }, adaptRoute(makeAddUserController()))
}
