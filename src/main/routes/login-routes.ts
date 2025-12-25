import { FastifyInstance } from 'fastify'
import { adaptRoute } from '@/main/adapters/fastify-route-adapter'
import { makeLoginController } from '@/main/factories/login/login-controller-factory'
import { makeRefreshTokenController } from '@/main/factories/login/refresh-token-controller-factory'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.post('/login', {
    config: {
      rateLimit: {
        max: 5,
        timeWindow: '1 minute'
      }
    }
  }, adaptRoute(makeLoginController()))

  fastify.post('/refresh-token', adaptRoute(makeRefreshTokenController()))
}
