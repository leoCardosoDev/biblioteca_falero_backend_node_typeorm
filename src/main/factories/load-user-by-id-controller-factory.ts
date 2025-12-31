import { Controller } from '@/presentation/protocols/controller'
import { LoadUserByIdController } from '@/presentation/controllers/user/load-user-by-id-controller'
import { DbLoadUserById } from '@/application/usecases/db-load-user-by-id'
import { UserTypeOrmRepository } from '@/infra/db/typeorm/user-repository'

export const makeLoadUserByIdController = (): Controller => {
  const userRepository = new UserTypeOrmRepository()
  const dbLoadUserById = new DbLoadUserById(userRepository)
  return new LoadUserByIdController(dbLoadUserById)
}
