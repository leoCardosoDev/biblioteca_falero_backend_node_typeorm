import { DbRefreshToken } from '@/application/usecases/db-refresh-token'
import { SessionTypeOrmRepository } from '@/infra/db/typeorm/session-repository'
import { JwtAdapter } from '@/infra/cryptography/jwt-adapter'
import { Sha256Adapter } from '@/infra/cryptography/sha256-adapter'
import { RefreshToken } from '@/domain/usecases/refresh-token'

export const makeDbRefreshToken = (): RefreshToken => {
  const sha256Adapter = new Sha256Adapter()
  const jwtAdapter = new JwtAdapter(process.env.JWT_SECRET ?? 'secret')
  const sessionRepository = new SessionTypeOrmRepository()
  const refreshTokenExpirationDays = parseInt(process.env.REFRESH_TOKEN_EXPIRATION_DAYS ?? '7', 10)

  return new DbRefreshToken(
    sessionRepository,  // LoadSessionByTokenRepository
    sessionRepository,  // LoadUserBySessionRepository
    sessionRepository,  // InvalidateSessionRepository
    sessionRepository,  // InvalidateAllUserSessionsRepository
    sessionRepository,  // SaveSessionRepository
    sha256Adapter,      // Hasher
    jwtAdapter,         // Encrypter
    refreshTokenExpirationDays
  )
}
