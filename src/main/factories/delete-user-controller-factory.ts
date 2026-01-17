import { Controller } from '@/shared/presentation/protocols'
import { DeleteUserController } from '@/modules/identity/presentation/controllers/delete-user-controller'
import { DbDeleteUser } from '@/modules/identity/application/usecases/db-delete-user'
import { UserTypeOrmRepository } from '@/modules/identity/infra/db/typeorm/repositories/user-repository'

export const makeDeleteUserController = (): Controller => {
  const userTypeOrmRepository = new UserTypeOrmRepository()
  const dbDeleteUser = new DbDeleteUser(userTypeOrmRepository)
  return new DeleteUserController(dbDeleteUser)
}
