import { Controller } from '@/presentation/protocols'
import { UpdateUserController } from '@/presentation/controllers/user/update-user-controller'
import { DbUpdateUser } from '@/application/usecases/db-update-user'
import { UserTypeOrmRepository } from '@/infra/db/typeorm/user-repository'

export const makeUpdateUserController = (): Controller => {
  const userTypeOrmRepository = new UserTypeOrmRepository()
  const dbUpdateUser = new DbUpdateUser(userTypeOrmRepository)
  return new UpdateUserController(dbUpdateUser)
}
