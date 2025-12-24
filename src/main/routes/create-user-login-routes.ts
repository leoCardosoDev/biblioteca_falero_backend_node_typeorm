import { FastifyInstance } from 'fastify'

import { adaptRoute } from '@/main/adapters/fastify-route-adapter'
import { adaptMiddleware } from '@/main/adapters/fastify-middleware-adapter'
import { makeCreateUserLoginController } from '@/main/factories/create-user-login-controller-factory'
import { makeAuthMiddleware, makeLibrarianOrAdmin } from '@/main/factories/middlewares'

export default (fastify: FastifyInstance): void => {
  fastify.post('/users/:userId/login', {
    preHandler: [
      adaptMiddleware(makeAuthMiddleware()),
      adaptMiddleware(makeLibrarianOrAdmin())
    ]
  }, adaptRoute(makeCreateUserLoginController()))
}
