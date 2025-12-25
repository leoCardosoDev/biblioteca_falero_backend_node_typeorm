import { UserSessionModel, UserId } from '@/domain/models'
import { SessionId } from '@/domain/models/ids'

export interface LoadSessionByTokenRepository {
  loadByToken: (tokenHash: string) => Promise<UserSessionModel | null>
}

export interface SaveSessionRepository {
  save: (session: Omit<UserSessionModel, 'id' | 'createdAt'>) => Promise<UserSessionModel>
}

export interface InvalidateSessionRepository {
  invalidate: (sessionId: SessionId) => Promise<void>
}



export interface LoadUserBySessionRepository {
  loadUserBySessionId: (sessionId: SessionId) => Promise<{ id: UserId; name: string; role: string } | null>
}
