import { CreateUserLoginController } from '@/presentation/controllers/create-user-login-controller'
import { Controller } from '@/presentation/protocols'
import { makeCreateUserLoginValidation } from './create-user-login-validation-factory'
import { DbCreateUserLogin } from '@/application/usecases/db-create-user-login'
import { LoginTypeOrmRepository } from '@/infra/db/typeorm/login-repository'
import { BcryptAdapter } from '@/infra/cryptography/bcrypt-adapter'

export const makeCreateUserLoginController = (): Controller => {
  const salt = 12
  const bcryptAdapter = new BcryptAdapter(salt)
  const loginTypeOrmRepository = new LoginTypeOrmRepository()
  const dbCreateUserLogin = new DbCreateUserLogin(bcryptAdapter, loginTypeOrmRepository)
  return new CreateUserLoginController(makeCreateUserLoginValidation(), dbCreateUserLogin)
}
