export type AuthenticationParams = {
  email: string
  password: string
}

export type AuthenticationModel = {
  accessToken: string
  name: string
  role: string
}

export interface Authentication {
  auth: (params: AuthenticationParams) => Promise<AuthenticationModel | undefined>
}
