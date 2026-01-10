import { adaptRoute } from '@/main/adapters/fastify-route-adapter'
import { adaptMiddleware } from '@/main/adapters/fastify-middleware-adapter'
import { makeLoadCityByIdController } from '@/main/factories/load-city-by-id-controller-factory'
import { makeLoadStateByIdController } from '@/main/factories/load-state-by-id-controller-factory'
import { makeAuthMiddleware } from '@/main/factories/middlewares'
import { errorSchema } from '@/main/config/error-schema'
import { FastifyInstance } from 'fastify'

export default async (app: FastifyInstance): Promise<void> => {
  app.get('/cities/:id', {
    schema: {
      tags: ['Geography'],
      summary: 'Load city by id',
      description: 'Returns a city by id. Requires a valid access token.',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' }
        }
      },
      response: {
        200: { $ref: 'City#' },
        204: { type: 'null', description: 'No Content' },
        403: errorSchema
      }
    },
    preHandler: [adaptMiddleware(makeAuthMiddleware())]
  }, adaptRoute(makeLoadCityByIdController()))

  app.get('/states/:id', {
    schema: {
      tags: ['Geography'],
      summary: 'Load state by id',
      description: 'Returns a state by id. Requires a valid access token.',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' }
        }
      },
      response: {
        200: { $ref: 'State#' },
        204: { type: 'null', description: 'No Content' },
        403: errorSchema
      }
    },
    preHandler: [adaptMiddleware(makeAuthMiddleware())]
  }, adaptRoute(makeLoadStateByIdController()))
}
