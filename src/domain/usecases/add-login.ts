import { LoginModel } from '@/domain/models/login'

export type AddLoginParams = Omit<LoginModel, 'id' | 'accessToken'>

export interface AddLogin {
  add: (login: AddLoginParams) => Promise<LoginModel>
}
