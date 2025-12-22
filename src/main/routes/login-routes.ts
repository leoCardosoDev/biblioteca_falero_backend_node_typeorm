import { FastifyInstance } from 'fastify'

import { adaptRoute } from '@/main/adapters/fastify-route-adapter'
import { makeAddLoginController } from '@/main/factories/add-login-controller-factory'

export default (fastify: FastifyInstance): void => {
  fastify.post('/logins', adaptRoute(makeAddLoginController()))
}
