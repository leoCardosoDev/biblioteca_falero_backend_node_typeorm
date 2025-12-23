import { DbAuthentication } from '@/application/usecases/db-authentication'
import { LoginTypeOrmRepository } from '@/infra/db/typeorm/login-repository'
import { BcryptAdapter } from '@/infra/cryptography/bcrypt-adapter'
import { JwtAdapter } from '@/infra/cryptography/jwt-adapter'
import { Authentication } from '@/domain/usecases/authentication'

export const makeDbAuthentication = (): Authentication => {
  const salt = 12
  const bcryptAdapter = new BcryptAdapter(salt)
  const jwtAdapter = new JwtAdapter(process.env.JWT_SECRET ?? 'secret')
  const loginRepository = new LoginTypeOrmRepository()
  return new DbAuthentication(loginRepository, bcryptAdapter, jwtAdapter, loginRepository)
}
