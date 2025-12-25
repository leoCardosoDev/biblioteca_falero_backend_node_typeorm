import { UserSessionModel } from '@/domain/models'

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
  loadUserBySessionId: (sessionId: string) => Promise<{ id: string; name: string; role: string } | null>
}
