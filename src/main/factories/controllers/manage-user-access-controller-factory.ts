
import { makeDbManageUserAccess } from '@/main/factories/usecases/db-manage-user-access-factory'
import { ManageUserAccessController } from '@/presentation/controllers/manage-user-access-controller'
import { Controller } from '@/presentation/protocols/controller'

export const makeManageUserAccessController = (): Controller => {
  return new ManageUserAccessController(makeDbManageUserAccess())
}
