import { FastifyInstance } from 'fastify'
import { adaptRoute } from '@/main/adapters/fastify-route-adapter'
import { makeAddNeighborhoodController } from '@/main/factories/controllers/add-neighborhood-controller-factory'
import { adminAuth } from '@/main/middlewares/admin-auth'

export default async (app: FastifyInstance): Promise<void> => {
  app.post('/neighborhoods', { preHandler: adminAuth }, adaptRoute(makeAddNeighborhoodController()))
}
