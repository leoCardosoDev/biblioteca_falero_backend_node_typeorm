import { Controller } from '@/shared/presentation/protocols'
import { UpdateUserController } from '@/modules/identity/presentation/controllers/update-user-controller'
import { DbUpdateUser } from '@/modules/identity/application/usecases/db-update-user'
import { UserTypeOrmRepository } from '@/modules/identity/infra/db/typeorm/repositories/user-repository'

import { makeUpdateUserValidation } from '@/main/factories/update-user-validation-factory'

export const makeUpdateUserController = (): Controller => {
  const userTypeOrmRepository = new UserTypeOrmRepository()
  const dbUpdateUser = new DbUpdateUser(userTypeOrmRepository)
  return new UpdateUserController(makeUpdateUserValidation(), dbUpdateUser)
}
