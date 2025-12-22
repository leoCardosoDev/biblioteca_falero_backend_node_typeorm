export type AuthenticationParams = {
  email: string
  password: string
}

export type AuthenticationModel = {
  accessToken: string
  name: string
}

export interface Authentication {
  auth: (authentication: AuthenticationParams) => Promise<AuthenticationModel | null>
}
