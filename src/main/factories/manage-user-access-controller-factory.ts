import { Controller } from '@/shared/presentation/protocols'
import { ManageUserAccessController } from '@/modules/identity/presentation/controllers/manage-user-access-controller'
import { makeManageUserAccess } from '@/main/factories/usecases/db-manage-user-access-factory'
import { makeManageUserAccessValidation } from '@/main/factories/manage-user-access-validation-factory'

export const makeManageUserAccessController = (): Controller => {
  return new ManageUserAccessController(
    makeManageUserAccessValidation(),
    makeManageUserAccess()
  )
}
