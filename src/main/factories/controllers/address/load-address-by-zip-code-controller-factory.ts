import { LoadAddressByZipCodeController } from '@/modules/geography/presentation/controllers/load-address-by-zip-code-controller'

import { DbLoadAddressByZipCode } from '@/modules/geography/application/usecases/db-load-address-by-zip-code'
import { GetOrCreateGeoEntityService } from '@/modules/geography/domain/services/get-or-create-geo-entity-service'
import { StateTypeOrmRepository } from '@/modules/geography/infra/db/typeorm/repositories/state-repository'
import { CityTypeOrmRepository } from '@/modules/geography/infra/db/typeorm/repositories/city-repository'
import { NeighborhoodTypeOrmRepository } from '@/modules/geography/infra/db/typeorm/repositories/neighborhood-repository'
import { Controller } from '@/shared/presentation/protocols'
import { AxiosHttpClient } from '@/shared/infra/http/axios-http-client'
import { ViaCepAdapter, ViaCepResponse } from '@/shared/infra/gateways/via-cep-adapter'
import { HttpClient } from '@/shared/application/protocols/http/http-client'
import { RedisCacheAdapter } from '@/shared/infra/cache/redis-cache-adapter'
import { CachedAddressGateway } from '@/shared/infra/gateways/cached-address-gateway'
import { ZodLoadAddressByZipCodeValidator } from '@/modules/geography/infra/validators/zod-load-address-by-zip-code-validation'

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
