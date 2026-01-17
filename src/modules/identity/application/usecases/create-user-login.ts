import { LoginModel } from '@/modules/identity/domain/models/login'
import { Id } from '@/shared/domain/value-objects/id'
import { UserRole } from '@/modules/identity/domain/value-objects/user-role'
import { UserStatus } from '@/modules/identity/domain/value-objects/user-status'

export interface CreateUserLoginParams {
  userId: Id
  password: string
  role?: UserRole
  status?: UserStatus
}

export interface CreateUserLogin {
  create: (params: CreateUserLoginParams) => Promise<LoginModel>
}
