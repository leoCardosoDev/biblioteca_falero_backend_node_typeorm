import { FastifyInstance } from 'fastify'
import { adaptRoute } from '@/main/adapters/fastify-route-adapter'
import { adaptMiddleware } from '@/main/adapters/fastify-middleware-adapter'
import { makeAdminOnly, makeAuthMiddleware } from '@/main/factories/middlewares'
import { makeLoadAddressByZipCodeController } from '@/main/factories/controllers/address/load-address-by-zip-code-controller-factory'
import { errorSchema } from '@/main/config/error-schema'

const loadAddressByZipCodeSchema = {
  tags: ['Addresses'],
  summary: 'Load address by zip code',
  description: 'Returns address information and geo IDs for a given zip code. Requires admin role.',
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    properties: {
      zipCode: { type: 'string', description: 'Address Zip Code' }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        zipCode: { type: 'string' },
        street: { type: 'string' },
        neighborhood: { type: 'string' },
        city: { type: 'string' },
        state: { type: 'string' },
        stateId: { type: 'string', format: 'uuid' },
        cityId: { type: 'string', format: 'uuid' },
        neighborhoodId: { type: 'string', format: 'uuid' }
      }
    },
    400: errorSchema,
    404: errorSchema
  }
}

export default async (app: FastifyInstance): Promise<void> => {
  app.get('/addresses/cep/:zipCode', {
    schema: loadAddressByZipCodeSchema,
    preHandler: [
      adaptMiddleware(makeAuthMiddleware()),
      adaptMiddleware(makeAdminOnly())
    ]
  }, adaptRoute(makeLoadAddressByZipCodeController()))
}
