import { UserSessionModel } from '@/domain/models'
import { Id } from '@/domain/value-objects/id'

export interface LoadSessionByTokenRepository {
  loadByToken: (tokenHash: string) => Promise<UserSessionModel | null>
}

export interface SaveSessionRepository {
  save: (session: Omit<UserSessionModel, 'id' | 'createdAt'>) => Promise<UserSessionModel>
}

export interface InvalidateSessionRepository {
  invalidate: (sessionId: string) => Promise<void>
}

export interface LoadUserBySessionRepository {
  loadUserBySessionId: (sessionId: string) => Promise<{ id: Id; name: string; role: string } | null>
}
