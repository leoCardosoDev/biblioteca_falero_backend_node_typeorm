import { Id } from '@/shared/domain/value-objects/id'

export type UserSessionModel = {
  id: Id
  userId: Id
  refreshTokenHash: string
  expiresAt: Date
  ipAddress?: string
  userAgent?: string
  isValid: boolean
  createdAt: Date
}
