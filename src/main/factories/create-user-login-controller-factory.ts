import { CreateUserLoginController, Controller } from '@/presentation'
import { DbCreateUserLogin } from '@/application/usecases'
import { LoginTypeOrmRepository, RoleRepository, UserTypeOrmRepository, BcryptAdapter } from '@/infra'
import { makeCreateUserLoginValidation } from './create-user-login-validation-factory'

export const makeCreateUserLoginController = (): Controller => {
  const salt = 12
  const bcryptAdapter = new BcryptAdapter(salt)
  const loginTypeOrmRepository = new LoginTypeOrmRepository()
  const roleRepository = new RoleRepository()
  const userTypeOrmRepository = new UserTypeOrmRepository()
  const dbCreateUserLogin = new DbCreateUserLogin(bcryptAdapter, loginTypeOrmRepository, roleRepository, userTypeOrmRepository)
  return new CreateUserLoginController(makeCreateUserLoginValidation(), dbCreateUserLogin)
}
