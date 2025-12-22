import { AddLoginParams } from '@/domain/usecases/add-login'
import { LoginModel } from '@/domain/models/login'

export interface AddLoginRepository {
  add: (loginData: AddLoginParams) => Promise<LoginModel>
}
