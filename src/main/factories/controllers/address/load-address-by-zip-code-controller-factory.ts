import { LoadAddressByZipCodeController } from '@/presentation/controllers/address/load-address-by-zip-code-controller'

import { AddressResolutionService } from '@/application/services/address/address-resolution-service'
import { GetOrCreateGeoEntityService } from '@/domain/services/geo/get-or-create-geo-entity-service'
import { ViaCepAdapter, ViaCepResponse } from '@/infra/gateways/via-cep-adapter'
import { CachedAddressGateway } from '@/infra/gateways/cached-address-gateway'
import { AxiosHttpClient } from '@/infra/http/axios-http-client'
import { RedisCacheAdapter } from '@/infra/cache/redis-cache-adapter'
import { StateTypeOrmRepository } from '@/infra/db/typeorm/state-repository'
import { CityTypeOrmRepository } from '@/infra/db/typeorm/city-repository'
import { NeighborhoodTypeOrmRepository } from '@/infra/db/typeorm/neighborhood-repository'
import { Controller } from '@/presentation/protocols'
import { HttpClient } from '@/application/protocols/http/http-client'

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

  const addressResolutionService = new AddressResolutionService(addressGateway, geoService, redisCache)

  return new LoadAddressByZipCodeController(addressResolutionService)
}
