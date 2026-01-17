import { LogoutController } from '@/modules/identity/presentation/controllers/logout-controller'
import { Controller } from '@/shared/presentation/protocols/controller'
import { makeLogoutValidation } from './logout-validation-factory'
import { makeDbLogout } from '@/main/factories/usecases/db-logout-factory'

export const makeLogoutController = (): Controller => {
  return new LogoutController(makeDbLogout(), makeLogoutValidation())
}
