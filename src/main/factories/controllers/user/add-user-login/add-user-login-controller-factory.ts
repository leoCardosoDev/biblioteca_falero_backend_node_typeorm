import { AddUserLoginController } from '@/presentation/controllers/user/add-user-login-controller'
import { Controller } from '@/presentation/protocols/controller'
import { makeAddUserLoginValidation } from './add-user-login-validation-factory'
import { DbAddUserLogin } from '@/application/usecases/db-add-user-login'
import { LoginTypeOrmRepository } from '@/infra/db/typeorm/login-repository'
import { RoleTypeOrmRepository } from '@/infra/db/typeorm/role-repository'
import { BcryptAdapter } from '@/infra/cryptography/bcrypt-adapter'

export const makeAddUserLoginController = (): Controller => {
  const salt = 12
  const bcryptAdapter = new BcryptAdapter(salt)
  const loginRepository = new LoginTypeOrmRepository()
  const roleTypeOrmRepository = new RoleTypeOrmRepository()
  const dbAddUserLogin = new DbAddUserLogin(bcryptAdapter, loginRepository, roleTypeOrmRepository)
  return new AddUserLoginController(dbAddUserLogin, makeAddUserLoginValidation())
}
