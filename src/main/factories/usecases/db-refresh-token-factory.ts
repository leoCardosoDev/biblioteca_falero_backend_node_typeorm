import { DbRefreshToken } from '@/modules/identity/application/usecases/db-refresh-token'
import { SessionTypeOrmRepository } from '@/modules/identity/infra/db/typeorm/repositories/session-repository'
import { JwtAdapter } from '@/shared/infra/cryptography/jwt-adapter'
import { Sha256Adapter } from '@/shared/infra/cryptography/sha256-adapter'
import { RefreshToken } from '@/modules/identity/domain/usecases/refresh-token'

export const makeDbRefreshToken = (): RefreshToken => {
  const sha256Adapter = new Sha256Adapter()
  const jwtAdapter = new JwtAdapter(process.env.JWT_SECRET ?? 'secret')
  const sessionRepository = new SessionTypeOrmRepository()
  const refreshTokenExpirationDays = parseInt(process.env.REFRESH_TOKEN_EXPIRATION_DAYS ?? '7', 10)

  return new DbRefreshToken(
    sessionRepository,  
    sessionRepository,  
    sessionRepository,  
    sessionRepository,  
    sha256Adapter,      
    jwtAdapter,         
    refreshTokenExpirationDays
  )
}
