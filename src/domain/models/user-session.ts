export type UserSessionModel = {
  id: string
  userId: string
  refreshTokenHash: string
  expiresAt: Date
  ipAddress?: string
  userAgent?: string
  isValid: boolean
  createdAt: Date
}
