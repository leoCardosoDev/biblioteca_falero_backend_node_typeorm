import { Email } from '@/modules/identity/domain/value-objects/email'

export type AuthenticationParams = {
  email: Email
  password: string
}

export type AuthenticationModel = {
  accessToken: string
  refreshToken: string
  name: string
  role: string
}

export interface Authentication {
  auth: (params: AuthenticationParams) => Promise<AuthenticationModel | undefined>
}

