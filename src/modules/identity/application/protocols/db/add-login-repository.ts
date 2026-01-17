import { AddUserLoginParams } from '@/modules/identity/domain/usecases/add-user-login'
import { LoginModel } from '@/modules/identity/domain/models/login'
import { Id } from '@/shared/domain/value-objects/id'

export interface AddLoginRepository {
  add: (data: Omit<AddUserLoginParams, 'role' | 'actorId'> & { passwordHash: string, roleId: Id }) => Promise<LoginModel>
}
