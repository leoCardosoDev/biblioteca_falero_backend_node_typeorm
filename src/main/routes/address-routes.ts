import { FastifyInstance } from 'fastify'
import { adaptRoute } from '@/main/adapters/fastify-route-adapter'
import { makeLoadAddressByZipCodeController } from '@/main/factories/controllers/address/load-address-by-zip-code-controller-factory'

export default async (app: FastifyInstance): Promise<void> => {
  app.get('/addresses/cep/:zipCode', adaptRoute(makeLoadAddressByZipCodeController()))
}
