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
    const dataSource = TypeOrmHelper.getRepository(SessionTypeOrmEntity)

    // Single query with JOINs for better performance
    const result = await dataSource
      .createQueryBuilder('session')
      .innerJoin(UserTypeOrmEntity, 'user', 'user.id = session.userId')
      .leftJoin(LoginTypeOrmEntity, 'login', 'login.userId = session.userId')
      .select(['user.id', 'user.name', 'login.role'])
      .where('session.id = :sessionId', { sessionId })
      .getRawOne()

    if (!result) return null

    return {
      id: result.user_id,
      name: result.user_name ?? '',
      role: result.login_role ?? 'MEMBER'
    }
  }
}
