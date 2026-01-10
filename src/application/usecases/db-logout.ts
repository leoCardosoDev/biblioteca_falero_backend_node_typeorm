import { Logout } from '@/domain/usecases/logout'
import { Hasher } from '@/application/protocols/cryptography/hasher'
import { LoadSessionByTokenRepository, InvalidateSessionRepository } from '@/application/protocols/db/session-repository'

export class DbLogout implements Logout {
  constructor(
    private readonly hasher: Hasher,
    private readonly loadSessionByTokenRepository: LoadSessionByTokenRepository,
    private readonly invalidateSessionRepository: InvalidateSessionRepository
  ) { }

  async logout(refreshToken: string): Promise<void> {
    const tokenHash = await this.hasher.hash(refreshToken)
    const session = await this.loadSessionByTokenRepository.loadByToken(tokenHash)
    if (session) {
      await this.invalidateSessionRepository.invalidate(session.id.value)
    }
  }
}
