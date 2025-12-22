import { CreateUserLoginParams } from '@/domain/usecases/create-user-login'
import { LoginModel } from '@/domain/models/login'

export interface CreateUserLoginRepository {
  create: (data: CreateUserLoginParams) => Promise<LoginModel>
}
