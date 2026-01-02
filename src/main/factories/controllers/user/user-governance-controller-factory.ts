
import { UpdateUserStatusController, UpdateUserRoleController } from '@/presentation/controllers/user/user-governance-controller'
import { Controller } from '@/presentation/protocols'
import { makeBlockUser } from '@/main/factories/usecases/block-user-factory'
import { makePromoteUser } from '@/main/factories/usecases/promote-user-factory'
import { makeUpdateUserStatusValidation, makeUpdateUserRoleValidation } from '@/main/factories/user-governance-validation-factory'

export const makeUpdateUserStatusController = (): Controller => {
  return new UpdateUserStatusController(makeUpdateUserStatusValidation(), makeBlockUser())
}

export const makeUpdateUserRoleController = (): Controller => {
  return new UpdateUserRoleController(makeUpdateUserRoleValidation(), makePromoteUser())
}
