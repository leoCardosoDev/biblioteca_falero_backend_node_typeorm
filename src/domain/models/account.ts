export type AccountModel = {
  id: string
  name: string
  email: string
  password?: string // password is optional because it might not be returned in some responses
  accessToken?: string
  role?: string
}
