import { LoginId, UserId } from './ids'

export type LoginModel = {
  id: LoginId
  userId: UserId
  password: string
  role?: string
  accessToken?: string
  name?: string
}
