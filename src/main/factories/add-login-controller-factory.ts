import { AddLoginController } from '@/presentation/controllers/add-login-controller'
import { Controller } from '@/presentation/protocols'
import { makeAddLoginValidation } from './add-login-validation-factory'
import { DbAddLogin } from '@/data/usecases/add-login/db-add-login'
import { LoginTypeOrmRepository } from '@/infra/db/typeorm/login-repository'
import { BcryptAdapter } from '@/infra/cryptography/bcrypt-adapter'

export const makeAddLoginController = (): Controller => {
  const salt = 12
  const bcryptAdapter = new BcryptAdapter(salt)
  const loginTypeOrmRepository = new LoginTypeOrmRepository()
  const dbAddLogin = new DbAddLogin(bcryptAdapter, loginTypeOrmRepository)
  return new AddLoginController(makeAddLoginValidation(), dbAddLogin)
}
