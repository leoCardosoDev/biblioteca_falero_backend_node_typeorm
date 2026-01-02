import { AddUserLoginParams } from '@/domain/usecases/add-user-login'
import { LoginModel } from '@/domain/models/login'
import { Id } from '@/domain/value-objects/id'

export interface AddLoginRepository {
  add: (data: Omit<AddUserLoginParams, 'role'> & { passwordHash: string, roleId: Id }) => Promise<LoginModel>
}
