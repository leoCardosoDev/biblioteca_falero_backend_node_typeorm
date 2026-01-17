import { DomainEventTypeOrmRepository } from '@/modules/identity/infra/db/typeorm/repositories/domain-event-repository'
import { AddUserController } from '@/modules/identity/presentation/controllers/add-user-controller'
import { Controller } from '@/shared/presentation/protocols'

import { AxiosHttpClient } from '@/shared/infra/http/axios-http-client'
import { ViaCepAdapter, ViaCepResponse } from '@/shared/infra/gateways/via-cep-adapter'
import { CachedAddressGateway } from '@/shared/infra/gateways/cached-address-gateway'
import { RedisCacheAdapter } from '@/shared/infra/cache/redis-cache-adapter'
import { UserTypeOrmRepository } from '@/modules/identity/infra/db/typeorm/repositories/user-repository'
import { StateTypeOrmRepository } from '@/modules/geography/infra/db/typeorm/repositories/state-repository'
import { CityTypeOrmRepository } from '@/modules/geography/infra/db/typeorm/repositories/city-repository'
import { NeighborhoodTypeOrmRepository } from '@/modules/geography/infra/db/typeorm/repositories/neighborhood-repository'

import { DbAddUser } from '@/modules/identity/application/usecases/db-add-user'
import { DbResolveAddress } from '@/modules/geography/application/usecases/db-resolve-address'
import { HttpClient } from '@/shared/application/protocols/http/http-client'

import { GetOrCreateGeoEntityService } from '@/modules/geography/domain/services/get-or-create-geo-entity-service'
import { DefaultAddressResolutionPolicy } from '@/modules/geography/domain/services/address-resolution-policy'
import { UUIDGenerator } from '@/shared/infra/gateways/uuid-generator'

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
