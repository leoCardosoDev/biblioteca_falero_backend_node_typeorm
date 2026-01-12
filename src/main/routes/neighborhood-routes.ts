import { FastifyInstance } from 'fastify'
import { adaptRoute } from '@/main/adapters/fastify-route-adapter'
import { errorSchema } from '@/main/config/error-schema'
import { makeAddNeighborhoodController } from '@/main/factories/controllers/add-neighborhood-controller-factory'
import { makeLoadNeighborhoodByIdController } from '@/main/factories/controllers/load-neighborhood-by-id-controller-factory'
import { adaptMiddleware } from '@/main/adapters/fastify-middleware-adapter'
import { makeAdminOnly, makeAuthMiddleware } from '@/main/factories/middlewares'

const addNeighborhoodSchema = {
  tags: ['Addresses'],
  summary: 'Add a new neighborhood',
  description: 'Adds a new neighborhood to the system. Requires admin role.',
  security: [{ bearerAuth: [] }],
  body: {
    type: 'object',
    required: ['name', 'cityId'],
    properties: {
      name: { type: 'string', description: 'Neighborhood name' },
      cityId: { type: 'string', format: 'uuid', description: 'City ID' }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        name: { type: 'string' },
        cityId: { type: 'string', format: 'uuid' }
      }
    },
    400: errorSchema,
    403: errorSchema
  }
}

const loadNeighborhoodByIdSchema = {
  tags: ['Addresses'],
  summary: 'Load neighborhood by id',
  description: 'Load a neighborhood by id. Requires admin role.',
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        name: { type: 'string' },
        cityId: { type: 'string', format: 'uuid' }
      }
    },
    400: errorSchema,
    403: errorSchema,
    404: errorSchema
  }
}

export default async (app: FastifyInstance): Promise<void> => {
  app.post('/neighborhoods', {
    schema: addNeighborhoodSchema,
    preHandler: [
      adaptMiddleware(makeAuthMiddleware()),
      adaptMiddleware(makeAdminOnly())
    ]
  }, adaptRoute(makeAddNeighborhoodController()))

  app.get('/neighborhoods/:id', {
    schema: loadNeighborhoodByIdSchema,
    preHandler: [
      adaptMiddleware(makeAuthMiddleware()),
      adaptMiddleware(makeAdminOnly())
    ]
  }, adaptRoute(makeLoadNeighborhoodByIdController()))
}
