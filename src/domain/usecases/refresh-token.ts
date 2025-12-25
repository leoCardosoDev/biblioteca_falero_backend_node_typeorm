export type RefreshTokenParams = {
  refreshToken: string
  ipAddress?: string
  userAgent?: string
}

export type RefreshTokenResult = {
  accessToken: string
  refreshToken: string
  name: string
  role: string
}

export interface RefreshToken {
  refresh: (params: RefreshTokenParams) => Promise<RefreshTokenResult | null>
}
