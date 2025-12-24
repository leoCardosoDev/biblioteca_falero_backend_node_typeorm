import { LoadUsersController } from '@/presentation/controllers/user/load-users-controller'
import { Controller } from '@/presentation/protocols'
import { DbLoadUsers } from '@/application/usecases/db-load-users'
import { UserTypeOrmRepository } from '@/infra/db/typeorm/user-repository'

export const makeLoadUsersController = (): Controller => {
  const userTypeOrmRepository = new UserTypeOrmRepository()
  const dbLoadUsers = new DbLoadUsers(userTypeOrmRepository)
  return new LoadUsersController(dbLoadUsers)
}
