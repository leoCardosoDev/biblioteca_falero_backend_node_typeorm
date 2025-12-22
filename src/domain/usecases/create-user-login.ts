import { LoginModel } from '@/domain/models/login'

export type CreateUserLoginParams = Omit<LoginModel, 'id' | 'accessToken'>

export interface CreateUserLogin {
  create: (params: CreateUserLoginParams) => Promise<LoginModel>
}
