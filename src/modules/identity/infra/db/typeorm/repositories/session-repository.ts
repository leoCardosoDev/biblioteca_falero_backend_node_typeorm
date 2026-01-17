import {
  LoadUserBySessionRepository,
  SaveSessionRepository,
  InvalidateSessionRepository,
  LoadSessionByTokenRepository
} from '@/modules/identity/application/protocols/db/session-repository'
import { UserSessionModel } from '@/modules/identity/domain/models'
import { SessionTypeOrmEntity } from '../entities/session-entity'
import { UserTypeOrmEntity } from '../entities/user-entity'
import { LoginTypeOrmEntity } from '../entities/login-entity'
import { RoleTypeOrmEntity } from '../entities/role-entity'
import { TypeOrmHelper } from '@/shared/infra/db/typeorm/typeorm-helper'
import { Id } from '@/shared/domain/value-objects/id'

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
    return session ? this.toDomain(session) : null
  }

  async save(session: Omit<UserSessionModel, 'id' | 'createdAt'>): Promise<UserSessionModel> {
    const repository = TypeOrmHelper.getRepository(SessionTypeOrmEntity)
    const entity = repository.create({
      userId: session.userId.value,
      refreshTokenHash: session.refreshTokenHash,
      expiresAt: session.expiresAt,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      isValid: session.isValid
    })
    const saved = await repository.save(entity)
    return this.toDomain(saved)
  }

  async invalidate(sessionId: string): Promise<void> {
    const repository = TypeOrmHelper.getRepository(SessionTypeOrmEntity)
    await repository.update({ id: sessionId }, { isValid: false })
  }

  async loadUserBySessionId(sessionId: string): Promise<{ id: Id; name: string; role: string } | null> {
    const dataSource = TypeOrmHelper.getRepository(SessionTypeOrmEntity)
    const result = await dataSource
      .createQueryBuilder('session')
      .innerJoin(UserTypeOrmEntity, 'user', 'user.id = session.userId')
      .leftJoin(LoginTypeOrmEntity, 'login', 'login.userId = session.userId')
      .leftJoin(RoleTypeOrmEntity, 'role', 'role.id = login.roleId')
      .select(['user.id', 'user.name', 'role.slug'])
      .where('session.id = :sessionId', { sessionId })
      .getRawOne()

    if (!result) return null

    return {
      id: Id.create(result.user_id) as Id,
      name: result.user_name,
      role: result.role_slug ?? 'STUDENT'
    }
  }

  private toDomain(entity: SessionTypeOrmEntity): UserSessionModel {
    return {
      id: Id.create(entity.id) as Id,
      userId: Id.create(entity.userId) as Id,
      refreshTokenHash: entity.refreshTokenHash,
      expiresAt: entity.expiresAt,
      ipAddress: entity.ipAddress,
      userAgent: entity.userAgent,
      isValid: entity.isValid,
      createdAt: entity.createdAt
    }
  }
}
