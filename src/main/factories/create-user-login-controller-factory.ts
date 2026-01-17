import { AddUserLoginController } from '@/modules/identity/presentation/controllers/add-user-login-controller'
import { Controller } from '@/shared/presentation/protocols'
import { makeCreateUserLoginValidation } from './create-user-login-validation-factory'
import { DbCreateUserLogin } from '@/modules/identity/application/usecases/db-create-user-login'
import { LoginTypeOrmRepository } from '@/modules/identity/infra/db/typeorm/repositories/login-repository'
import { RoleRepository } from '@/modules/identity/infra/db/typeorm/repositories/role-repository'
import { UserTypeOrmRepository } from '@/modules/identity/infra/db/typeorm/repositories/user-repository'
import { BcryptAdapter } from '@/shared/infra/cryptography/bcrypt-adapter'


export const makeCreateUserLoginController = (): Controller => {
  const salt = 12
  const bcryptAdapter = new BcryptAdapter(salt)
  const loginRepository = new LoginTypeOrmRepository()
  const roleRepository = new RoleRepository()
  const userTypeOrmRepository = new UserTypeOrmRepository()
  const dbCreateUserLogin = new DbCreateUserLogin(bcryptAdapter, loginRepository, roleRepository, userTypeOrmRepository, roleRepository)

  // Note: Factory name is legacy (makeCreateUserLogin), but Controller is AddUserLoginController
  return new AddUserLoginController(dbCreateUserLogin, makeCreateUserLoginValidation())
}
