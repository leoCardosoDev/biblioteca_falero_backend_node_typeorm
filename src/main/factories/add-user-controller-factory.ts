import { AddUserController } from '@/presentation/controllers/add-user-controller'
import { Controller } from '@/presentation/protocols'

import { AxiosHttpClient } from '@/infra/http/axios-http-client'
import { ViaCepAdapter, ViaCepResponse } from '@/infra/gateways/via-cep-adapter'
import { CachedAddressGateway } from '@/infra/gateways/cached-address-gateway'
import { RedisCacheAdapter } from '@/infra/cache/redis-cache-adapter'
import { UserTypeOrmRepository } from '@/infra/db/typeorm/user-repository'
import { DomainEventTypeOrmRepository } from '@/infra/db/typeorm/domain-event-repository'
import { StateTypeOrmRepository } from '@/infra/db/typeorm/state-repository'
import { CityTypeOrmRepository } from '@/infra/db/typeorm/city-repository'
import { NeighborhoodTypeOrmRepository } from '@/infra/db/typeorm/neighborhood-repository'

import { DbAddUser } from '@/application/usecases/db-add-user'
import { DbResolveAddress } from '@/application/usecases/db-resolve-address'
import { HttpClient } from '@/application/protocols/http/http-client'

import { GetOrCreateGeoEntityService } from '@/domain/services/geo/get-or-create-geo-entity-service'
import { DefaultAddressResolutionPolicy } from '@/domain/services/address/address-resolution-policy'
import { UUIDGenerator } from '@/infra/gateways/uuid-generator'

import { makeAddUserValidation } from './add-user-validation-factory'

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

  const addressResolutionPolicy = new DefaultAddressResolutionPolicy()
  const dbResolveAddress = new DbResolveAddress(addressResolutionPolicy, addressGateway, getOrCreateGeoEntityService)
  const idGenerator = new UUIDGenerator()

  const dbAddUser = new DbAddUser(
    userTypeOrmRepository,
    userTypeOrmRepository,
    userTypeOrmRepository,
    domainEventRepository,
    dbResolveAddress,
    idGenerator
  )
  return new AddUserController(makeAddUserValidation(), dbAddUser)
}
