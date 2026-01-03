import { CreateUserLoginController, Controller } from '@/presentation'
import { DbCreateUserLogin } from '@/application/usecases'
import { LoginTypeOrmRepository, RoleTypeOrmRepository, UserTypeOrmRepository, BcryptAdapter } from '@/infra'
import { makeCreateUserLoginValidation } from './create-user-login-validation-factory'

export const makeCreateUserLoginController = (): Controller => {
  const salt = 12
  const bcryptAdapter = new BcryptAdapter(salt)
  const loginTypeOrmRepository = new LoginTypeOrmRepository()
  const roleTypeOrmRepository = new RoleTypeOrmRepository()
  const userTypeOrmRepository = new UserTypeOrmRepository()
  const dbCreateUserLogin = new DbCreateUserLogin(bcryptAdapter, loginTypeOrmRepository, roleTypeOrmRepository, userTypeOrmRepository)
  return new CreateUserLoginController(makeCreateUserLoginValidation(), dbCreateUserLogin)
}
