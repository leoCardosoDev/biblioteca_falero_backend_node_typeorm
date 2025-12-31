import { FastifyInstance } from 'fastify'
import { adaptRoute } from '@/main/adapters/fastify-route-adapter'
import { makeAddNeighborhoodController } from '@/main/factories/controllers/add-neighborhood-controller-factory'
import { adaptMiddleware } from '@/main/adapters/fastify-middleware-adapter'
import { makeAdminOnly, makeAuthMiddleware } from '@/main/factories/middlewares'

export default async (app: FastifyInstance): Promise<void> => {
  app.post('/neighborhoods', {
    preHandler: [
      adaptMiddleware(makeAuthMiddleware()),
      adaptMiddleware(makeAdminOnly())
    ]
  }, adaptRoute(makeAddNeighborhoodController()))
}
