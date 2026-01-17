import { LoginController } from '@/modules/identity/presentation/controllers/login-controller'
import { Controller } from '@/shared/presentation/protocols/controller'
import { makeLoginValidation } from './login-validation-factory'
import { makeDbAuthentication } from '@/main/factories/usecases/db-authentication-factory'

export const makeLoginController = (): Controller => {
  return new LoginController(makeDbAuthentication(), makeLoginValidation())
}
