import { adaptRoute } from '@/main/adapters/fastify-route-adapter'
import { makeLoadCityByIdController } from '@/main/factories/load-city-by-id-controller-factory'
import { makeLoadStateByIdController } from '@/main/factories/load-state-by-id-controller-factory'
import { FastifyInstance } from 'fastify'

export default async (app: FastifyInstance): Promise<void> => {
  app.get('/cities/:id', {
    schema: {
      tags: ['Geography'],
      summary: 'Load city by id',
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' }
        }
      },
      response: {
        200: { $ref: 'City#' },
        204: { type: 'null', description: 'No Content' }
      }
    }
  }, adaptRoute(makeLoadCityByIdController()))

  app.get('/states/:id', {
    schema: {
      tags: ['Geography'],
      summary: 'Load state by id',
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' }
        }
      },
      response: {
        200: { $ref: 'State#' },
        204: { type: 'null', description: 'No Content' }
      }
    }
  }, adaptRoute(makeLoadStateByIdController()))
}
