import { FastifyInstance } from 'fastify'

import { adaptRoute } from '@/main/adapters/fastify-route-adapter'
import { makeCreateUserLoginController } from '@/main/factories/create-user-login-controller-factory'

export default (fastify: FastifyInstance): void => {
  fastify.post('/users/:userId/login', adaptRoute(makeCreateUserLoginController()))
}
