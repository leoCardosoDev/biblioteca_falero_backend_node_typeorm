import { Controller } from '@/presentation/protocols'
import { DeleteUserController } from '@/presentation/controllers/user/delete-user-controller'
import { DbDeleteUser } from '@/application/usecases/db-delete-user'
import { UserTypeOrmRepository } from '@/infra/db/typeorm/user-repository'

export const makeDeleteUserController = (): Controller => {
  const userTypeOrmRepository = new UserTypeOrmRepository()
  const dbDeleteUser = new DbDeleteUser(userTypeOrmRepository)
  return new DeleteUserController(dbDeleteUser)
}
