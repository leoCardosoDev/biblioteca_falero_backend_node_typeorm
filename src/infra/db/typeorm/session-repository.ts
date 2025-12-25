import {
  LoadSessionByTokenRepository,
  SaveSessionRepository,
  InvalidateSessionRepository,
  InvalidateAllUserSessionsRepository,
  LoadUserBySessionRepository
} from '@/application/protocols/db/session-repository'
import { UserSessionModel } from '@/domain/models'
import { SessionTypeOrmEntity } from './entities/session-entity'
import { UserTypeOrmEntity } from './entities/user-entity'
import { LoginTypeOrmEntity } from './entities/login-entity'
import { TypeOrmHelper } from './typeorm-helper'

export class SessionTypeOrmRepository implements
  LoadSessionByTokenRepository,
  SaveSessionRepository,
  InvalidateSessionRepository,
  InvalidateAllUserSessionsRepository,
  LoadUserBySessionRepository {

  async loadByToken(tokenHash: string): Promise<UserSessionModel | null> {
    const repository = TypeOrmHelper.getRepository(SessionTypeOrmEntity)
    const session = await repository.findOne({
      where: { refreshTokenHash: tokenHash, isValid: true }
    })
    return session ?? null
  }

  async save(session: Omit<UserSessionModel, 'id' | 'createdAt'>): Promise<UserSessionModel> {
    const repository = TypeOrmHelper.getRepository(SessionTypeOrmEntity)
    const entity = repository.create(session)
    const saved = await repository.save(entity)
    return saved as UserSessionModel
  }

  async invalidate(sessionId: string): Promise<void> {
    const repository = TypeOrmHelper.getRepository(SessionTypeOrmEntity)
    await repository.update({ id: sessionId }, { isValid: false })
  }

  async invalidateAllByUserId(userId: string): Promise<void> {
    const repository = TypeOrmHelper.getRepository(SessionTypeOrmEntity)
    await repository.update({ userId, isValid: true }, { isValid: false })
  }

  async loadUserBySessionId(sessionId: string): Promise<{ id: string; name: string; role: string } | null> {
    const sessionRepo = TypeOrmHelper.getRepository(SessionTypeOrmEntity)
    const session = await sessionRepo.findOne({ where: { id: sessionId } })
    if (!session) return null

    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    const user = await userRepo.findOne({ where: { id: session.userId } })
    if (!user) return null

    // Fetch role from logins table (where the actual role is stored)
    const loginRepo = TypeOrmHelper.getRepository(LoginTypeOrmEntity)
    const login = await loginRepo.findOne({ where: { userId: session.userId } })

    return { id: user.id, name: user.name ?? '', role: login?.role ?? 'MEMBER' }
  }
}
