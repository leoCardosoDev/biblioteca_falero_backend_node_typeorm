import { RefreshToken, RefreshTokenParams, RefreshTokenResult } from '@/domain/usecases/refresh-token'
import { Role } from '@/domain/models'
import {
  LoadSessionByTokenRepository,
  InvalidateSessionRepository,
  SaveSessionRepository,
  LoadUserBySessionRepository,
  InvalidateAllUserSessionsRepository
} from '@/application/protocols/db/session-repository'
import { Hasher } from '@/application/protocols/cryptography/hasher'
import { Encrypter } from '@/application/protocols/cryptography/encrypter'
import crypto from 'crypto'

export class DbRefreshToken implements RefreshToken {
  constructor(
    private readonly loadSessionByTokenRepository: LoadSessionByTokenRepository,
    private readonly loadUserBySessionRepository: LoadUserBySessionRepository,
    private readonly invalidateSessionRepository: InvalidateSessionRepository,
    private readonly invalidateAllUserSessionsRepository: InvalidateAllUserSessionsRepository,
    private readonly saveSessionRepository: SaveSessionRepository,
    private readonly hasher: Hasher,
    private readonly encrypter: Encrypter,
    private readonly refreshTokenExpirationDays: number = 7
  ) { }

  async refresh(params: RefreshTokenParams): Promise<RefreshTokenResult | null> {
    const tokenHash = await this.hasher.hash(params.refreshToken)
    const session = await this.loadSessionByTokenRepository.loadByToken(tokenHash)

    if (!session) {
      return null
    }

    // Check if session is valid and not expired
    if (!session.isValid) {
      return null
    }

    if (new Date() > session.expiresAt) {
      return null
    }

    // Load user data
    const user = await this.loadUserBySessionRepository.loadUserBySessionId(session.id)

    if (!user) {
      return null
    }

    // Token Rotation: Invalidate old session
    await this.invalidateSessionRepository.invalidate(session.id)

    // Generate new refresh token
    const newRefreshToken = crypto.randomBytes(32).toString('hex')
    const newRefreshTokenHash = await this.hasher.hash(newRefreshToken)

    // Calculate new expiration date
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + this.refreshTokenExpirationDays)

    // Save new session
    await this.saveSessionRepository.save({
      userId: session.userId,
      refreshTokenHash: newRefreshTokenHash,
      expiresAt,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      isValid: true
    })

    // Generate new access token
    const role = (user.role as Role) ?? Role.MEMBER
    const accessToken = await this.encrypter.encrypt({ id: user.id, role })

    return {
      accessToken,
      refreshToken: newRefreshToken,
      name: user.name,
      role: user.role
    }
  }
}
