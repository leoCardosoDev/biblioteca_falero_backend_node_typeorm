import { AddUserLoginParams } from '@/domain/usecases/add-user-login'
import { LoginModel } from '@/domain/models/login'

export interface AddLoginRepository {
  add: (data: AddUserLoginParams & { passwordHash: string }) => Promise<LoginModel>
}
