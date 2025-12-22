import { AddUserController } from '@/presentation/controllers/add-user-controller'
import { Controller } from '@/presentation/protocols'
import { makeAddUserValidation } from './add-user-validation-factory'
import { DbAddUser } from '@/application/usecases/db-add-user'
import { UserTypeOrmRepository } from '@/infra/db/typeorm/user-repository'

export const makeAddUserController = (): Controller => {
  const userTypeOrmRepository = new UserTypeOrmRepository()
  const dbAddUser = new DbAddUser(userTypeOrmRepository)
  return new AddUserController(makeAddUserValidation(), dbAddUser)
}
