import { AddUserController } from '@/presentation/controllers/add-user-controller'
import { Controller } from '@/presentation/protocols'
import { makeAddUserValidation } from './add-user-validation-factory'
import { DbAddUser } from '@/application/usecases/db-add-user'
import { UserTypeOrmRepository } from '@/infra/db/typeorm/user-repository'
import { DomainEventTypeOrmRepository } from '@/infra/db/typeorm/domain-event-repository'
import { StateTypeOrmRepository } from '@/infra/db/typeorm/state-repository'
import { CityTypeOrmRepository } from '@/infra/db/typeorm/city-repository'
import { NeighborhoodTypeOrmRepository } from '@/infra/db/typeorm/neighborhood-repository'
import { GetOrCreateGeoEntityService } from '@/domain/services/geo/get-or-create-geo-entity-service'
import { AddressResolutionService } from '@/application/services/address/address-resolution-service'

import { AxiosHttpClient } from '@/infra/http/axios-http-client'
import { ViaCepAdapter } from '@/infra/gateways/via-cep-adapter'
import { HttpClient } from '@/application/protocols/http/http-client'
import { ViaCepResponse } from '@/infra/gateways/via-cep-adapter'
import { RedisCacheAdapter } from '@/infra/cache/redis-cache-adapter'
import { CachedAddressGateway } from '@/infra/gateways/cached-address-gateway'

export const makeAddUserController = (): Controller => {
  const userTypeOrmRepository = new UserTypeOrmRepository()
  const domainEventRepository = new DomainEventTypeOrmRepository()
  const stateRepo = new StateTypeOrmRepository()
  const cityRepo = new CityTypeOrmRepository()
  const neighborhoodRepo = new NeighborhoodTypeOrmRepository()

  const getOrCreateGeoEntityService = new GetOrCreateGeoEntityService(
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

  const addressResolutionService = new AddressResolutionService(getOrCreateGeoEntityService, addressGateway)

  const dbAddUser = new DbAddUser(
    userTypeOrmRepository,
    userTypeOrmRepository,
    userTypeOrmRepository,
    domainEventRepository,
    addressResolutionService
  )
  return new AddUserController(makeAddUserValidation(), dbAddUser)
}
