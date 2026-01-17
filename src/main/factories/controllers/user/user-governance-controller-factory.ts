
import { UpdateUserStatusController, UpdateUserRoleController } from '@/modules/identity/presentation/controllers/user-governance-controller'
import { Controller } from '@/shared/presentation/protocols'
import { makeBlockUser } from '@/main/factories/usecases/block-user-factory'
import { makePromoteUser } from '@/main/factories/usecases/promote-user-factory'
import { makeUpdateUserStatusValidation, makeUpdateUserRoleValidation } from '@/main/factories/user-governance-validation-factory'

export const makeUpdateUserStatusController = (): Controller => {
  return new UpdateUserStatusController(makeUpdateUserStatusValidation(), makeBlockUser())
}

export const makeUpdateUserRoleController = (): Controller => {
  return new UpdateUserRoleController(makeUpdateUserRoleValidation(), makePromoteUser())
}
