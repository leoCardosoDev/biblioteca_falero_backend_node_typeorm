import { RefreshToken, RefreshTokenParams, RefreshTokenResult } from '@/domain/usecases/refresh-token'
import { Role } from '@/domain/models'
import { ExpirationDate } from '@/domain/value-objects/expiration-date'
import {
  LoadSessionByTokenRepository,
  InvalidateSessionRepository,
  SaveSessionRepository,
  LoadUserBySessionRepository
} from '@/application/protocols/db/session-repository'
import { Hasher } from '@/application/protocols/cryptography/hasher'
import { Encrypter } from '@/application/protocols/cryptography/encrypter'
import crypto from 'crypto'

export class DbRefreshToken implements RefreshToken {
  constructor(
    private readonly loadSessionByTokenRepository: LoadSessionByTokenRepository,
    private readonly loadUserBySessionRepository: LoadUserBySessionRepository,
    private readonly invalidateSessionRepository: InvalidateSessionRepository,
    private readonly saveSessionRepository: SaveSessionRepository,
    private readonly hasher: Hasher,
    private readonly encrypter: Encrypter,
    private readonly refreshTokenExpirationDays: number
  ) { }

  async refresh(params: RefreshTokenParams): Promise<RefreshTokenResult | null> {
    const tokenHash = await this.hasher.hash(params.refreshToken)
    const session = await this.loadSessionByTokenRepository.loadByToken(tokenHash)
    if (!session || !session.isValid || new Date() > session.expiresAt) {
      return null
    }

    const user = await this.loadUserBySessionRepository.loadUserBySessionId(session.id.value)
    if (!user) {
      return null
    }

    await this.invalidateSessionRepository.invalidate(session.id.value)

    const newRefreshToken = crypto.randomBytes(32).toString('hex')
    const newRefreshTokenHash = await this.hasher.hash(newRefreshToken)
    const expiresAt = ExpirationDate.fromDays(this.refreshTokenExpirationDays).toDate()

    await this.saveSessionRepository.save({
      userId: session.userId,
      refreshTokenHash: newRefreshTokenHash,
      expiresAt,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      isValid: true
    })

    const role = (user.role as Role) ?? Role.MEMBER
    const accessToken = await this.encrypter.encrypt({ id: user.id.value, role })

    return {
      accessToken,
      refreshToken: newRefreshToken,
      name: user.name,
      role: user.role
    }
  }
}
