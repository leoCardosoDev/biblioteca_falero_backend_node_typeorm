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

  const dbAddUser = new DbAddUser(
    userTypeOrmRepository,
    userTypeOrmRepository,
    userTypeOrmRepository,
    domainEventRepository,
    getOrCreateGeoEntityService
  )
  return new AddUserController(makeAddUserValidation(), dbAddUser)
}
