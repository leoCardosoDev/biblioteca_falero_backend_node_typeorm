import {
  LoadSessionByTokenRepository,
  SaveSessionRepository,
  InvalidateSessionRepository,
  LoadUserBySessionRepository
} from '@/application/protocols/db/session-repository'
import { UserSessionModel, UserId } from '@/domain/models'
import { SessionId } from '@/domain/models/ids'
import { SessionTypeOrmEntity } from './entities/session-entity'
import { DeepPartial } from 'typeorm'
import { UserTypeOrmEntity } from './entities/user-entity'
import { LoginTypeOrmEntity } from './entities/login-entity'
import { TypeOrmHelper } from './typeorm-helper'

export class SessionTypeOrmRepository implements
  LoadSessionByTokenRepository,
  SaveSessionRepository,
  InvalidateSessionRepository,
  LoadUserBySessionRepository {

  async loadByToken(tokenHash: string): Promise<UserSessionModel | null> {
    const repository = TypeOrmHelper.getRepository(SessionTypeOrmEntity)
    const session = await repository.findOne({
      where: { refreshTokenHash: tokenHash, isValid: true }
    })
    return (session as unknown as UserSessionModel) ?? null
  }

  async save(session: Omit<UserSessionModel, 'id' | 'createdAt'>): Promise<UserSessionModel> {
    const repository = TypeOrmHelper.getRepository(SessionTypeOrmEntity)
    const entity = repository.create(session as unknown as DeepPartial<SessionTypeOrmEntity>)
    const saved = await repository.save(entity)
    return saved as unknown as UserSessionModel
  }

  async invalidate(sessionId: SessionId): Promise<void> {
    const repository = TypeOrmHelper.getRepository(SessionTypeOrmEntity)
    await repository.update({ id: sessionId }, { isValid: false })
  }

  async loadUserBySessionId(sessionId: SessionId): Promise<{ id: UserId; name: string; role: string } | null> {
    const dataSource = TypeOrmHelper.getRepository(SessionTypeOrmEntity)
    const result = await dataSource
      .createQueryBuilder('session')
      .innerJoin(UserTypeOrmEntity, 'user', 'user.id = session.userId')
      .leftJoin(LoginTypeOrmEntity, 'login', 'login.userId = session.userId')
      .select(['user.id', 'user.name', 'login.role'])
      .where('session.id = :sessionId', { sessionId })
      .getRawOne()

    if (!result) return null

    return {
      id: result.user_id as UserId,
      name: result.user_name,
      role: result.login_role ?? 'MEMBER'
    }
  }

}
