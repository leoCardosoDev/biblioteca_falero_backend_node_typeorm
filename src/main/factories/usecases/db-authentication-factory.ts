import { DbAuthentication } from '@/modules/identity/application/usecases/db-authentication'
import { LoginTypeOrmRepository } from '@/modules/identity/infra/db/typeorm/repositories/login-repository'
import { SessionTypeOrmRepository } from '@/modules/identity/infra/db/typeorm/repositories/session-repository'
import { BcryptAdapter } from '@/shared/infra/cryptography/bcrypt-adapter'
import { JwtAdapter } from '@/shared/infra/cryptography/jwt-adapter'
import { Sha256Adapter } from '@/shared/infra/cryptography/sha256-adapter'
import { Authentication } from '@/modules/identity/application/usecases/authentication'

import { RoleRepository } from '@/modules/identity/infra/db/typeorm/repositories/role-repository'

export const makeDbAuthentication = (): Authentication => {
  const salt = 12
  const bcryptAdapter = new BcryptAdapter(salt)
  const sha256Adapter = new Sha256Adapter()
  const jwtAdapter = new JwtAdapter(process.env.JWT_SECRET ?? 'secret')
  const loginRepository = new LoginTypeOrmRepository()
  const roleRepository = new RoleRepository()
  const sessionRepository = new SessionTypeOrmRepository()
  const refreshTokenExpirationDays = parseInt(process.env.REFRESH_TOKEN_EXPIRATION_DAYS ?? '7', 10)

  return new DbAuthentication(
    loginRepository,
    roleRepository,
    bcryptAdapter,
    jwtAdapter,
    loginRepository,
    sessionRepository,
    sha256Adapter,
    refreshTokenExpirationDays
  )
}
