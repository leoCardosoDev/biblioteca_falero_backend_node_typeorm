import { LoadAddressByZipCodeController } from '@/presentation/controllers/address/load-address-by-zip-code-controller'

import { DbLoadAddressByZipCode } from '@/application/usecases/db-load-address-by-zip-code'
import { GetOrCreateGeoEntityService } from '@/domain/services/geo/get-or-create-geo-entity-service'
import { StateTypeOrmRepository } from '@/infra/db/typeorm/state-repository'
import { CityTypeOrmRepository } from '@/infra/db/typeorm/city-repository'
import { NeighborhoodTypeOrmRepository } from '@/infra/db/typeorm/neighborhood-repository'
import { Controller } from '@/presentation/protocols'
import { AxiosHttpClient } from '@/infra/http/axios-http-client'
import { ViaCepAdapter, ViaCepResponse } from '@/infra/gateways/via-cep-adapter'
import { HttpClient } from '@/application/protocols/http/http-client'
import { RedisCacheAdapter } from '@/infra/cache/redis-cache-adapter'
import { CachedAddressGateway } from '@/infra/gateways/cached-address-gateway'
import { ZodLoadAddressByZipCodeValidator } from '@/infra/validators/zod-load-address-by-zip-code-validation'

export const makeLoadAddressByZipCodeController = (): Controller => {

  const stateRepo = new StateTypeOrmRepository()
  const cityRepo = new CityTypeOrmRepository()
  const neighborhoodRepo = new NeighborhoodTypeOrmRepository()

  const geoService = new GetOrCreateGeoEntityService(
    stateRepo,
    cityRepo,
    cityRepo,
    neighborhoodRepo,
    neighborhoodRepo
  )

  const httpClient = new AxiosHttpClient()
  const viaCepGateway = new ViaCepAdapter(httpClient as unknown as HttpClient<ViaCepResponse>)
  const redisCache = new RedisCacheAdapter()
  const addressGateway = new CachedAddressGateway(viaCepGateway, redisCache)

  const dbLoadAddressByZipCode = new DbLoadAddressByZipCode(addressGateway, geoService)
  const validation = new ZodLoadAddressByZipCodeValidator()

  return new LoadAddressByZipCodeController(dbLoadAddressByZipCode, validation)
}
