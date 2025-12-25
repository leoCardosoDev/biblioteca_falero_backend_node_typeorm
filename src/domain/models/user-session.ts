import { SessionId, UserId } from './ids'

export type UserSessionModel = {
  id: SessionId
  userId: UserId
  refreshTokenHash: string
  expiresAt: Date
  ipAddress?: string
  userAgent?: string
  isValid: boolean
  createdAt: Date
}
