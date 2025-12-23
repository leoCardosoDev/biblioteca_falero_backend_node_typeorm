import { FastifyInstance } from 'fastify'
import { adaptRoute } from '@/main/adapters/fastify-route-adapter'
import { makeLoginController } from '@/main/factories/login/login-controller-factory'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.post('/login', adaptRoute(makeLoginController()))
}
