import { LogoutController } from '@/presentation/controllers/login/logout-controller'
import { Controller } from '@/presentation/protocols/controller'
import { makeLogoutValidation } from './logout-validation-factory'
import { makeDbLogout } from '@/main/factories/usecases/db-logout-factory'

export const makeLogoutController = (): Controller => {
  return new LogoutController(makeDbLogout(), makeLogoutValidation())
}
