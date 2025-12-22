import { adaptRoute } from '@/main/adapters/fastify-route-adapter'
import { makeAddUserController } from '@/main/factories/add-user-controller-factory'
import { FastifyInstance } from 'fastify'

export default (router: FastifyInstance): void => {
  router.post('/users', adaptRoute(makeAddUserController()))
}
