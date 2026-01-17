import { LoadUsersController } from '@/modules/identity/presentation/controllers/load-users-controller'
import { Controller } from '@/shared/presentation/protocols'
import { DbLoadUsers } from '@/modules/identity/application/usecases/db-load-users'
import { UserTypeOrmRepository } from '@/modules/identity/infra/db/typeorm/repositories/user-repository'

export const makeLoadUsersController = (): Controller => {
  const userTypeOrmRepository = new UserTypeOrmRepository()
  const dbLoadUsers = new DbLoadUsers(userTypeOrmRepository)
  return new LoadUsersController(dbLoadUsers)
}
