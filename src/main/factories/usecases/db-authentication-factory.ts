import { DbAuthentication } from '@/application/usecases/db-authentication'
import { LoginTypeOrmRepository } from '@/infra/db/typeorm/login-repository'
import { SessionTypeOrmRepository } from '@/infra/db/typeorm/session-repository'
import { BcryptAdapter } from '@/infra/cryptography/bcrypt-adapter'
import { JwtAdapter } from '@/infra/cryptography/jwt-adapter'
import { Sha256Adapter } from '@/infra/cryptography/sha256-adapter'
import { Authentication } from '@/domain/usecases/authentication'

export const makeDbAuthentication = (): Authentication => {
  const salt = 12
  const bcryptAdapter = new BcryptAdapter(salt)
  const sha256Adapter = new Sha256Adapter()
  const jwtAdapter = new JwtAdapter(process.env.JWT_SECRET ?? 'secret')
  const loginRepository = new LoginTypeOrmRepository()
  const sessionRepository = new SessionTypeOrmRepository()
  const refreshTokenExpirationDays = parseInt(process.env.REFRESH_TOKEN_EXPIRATION_DAYS ?? '7', 10)

  return new DbAuthentication(
    loginRepository,
    bcryptAdapter,
    jwtAdapter,
    loginRepository,
    sessionRepository,
    sha256Adapter,
    refreshTokenExpirationDays
  )
}
