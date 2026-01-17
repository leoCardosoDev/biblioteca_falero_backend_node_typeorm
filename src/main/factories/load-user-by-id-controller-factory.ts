import { Controller } from '@/shared/presentation/protocols/controller'
import { LoadUserByIdController } from '@/modules/identity/presentation/controllers/load-user-by-id-controller'
import { DbLoadUserById } from '@/modules/identity/application/usecases/db-load-user-by-id'
import { UserTypeOrmRepository } from '@/modules/identity/infra/db/typeorm/repositories/user-repository'

export const makeLoadUserByIdController = (): Controller => {
  const userRepository = new UserTypeOrmRepository()
  const dbLoadUserById = new DbLoadUserById(userRepository)
  return new LoadUserByIdController(dbLoadUserById)
}
