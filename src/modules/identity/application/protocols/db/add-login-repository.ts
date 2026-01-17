import { AddUserLoginParams } from '@/modules/identity/application/usecases/add-user-login'
import { LoginModel } from '@/modules/identity/domain/entities/login'
import { Id } from '@/shared/domain/value-objects/id'

export interface AddLoginRepository {
  add: (data: Omit<AddUserLoginParams, 'role' | 'actorId'> & { passwordHash: string, roleId: Id }) => Promise<LoginModel>
}
