export interface Logout {
  logout: (refreshToken: string) => Promise<void>
}
