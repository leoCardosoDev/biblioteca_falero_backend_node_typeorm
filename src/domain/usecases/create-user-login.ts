import { LoginModel } from '@/domain/models/login'
import { Id } from '@/domain/value-objects/id'
import { UserRole } from '@/domain/value-objects/user-role'
import { UserStatus } from '@/domain/value-objects/user-status'

export interface CreateUserLoginParams {
  userId: Id
  password: string
  role?: UserRole
  status?: UserStatus
}

export interface CreateUserLogin {
  create: (params: CreateUserLoginParams) => Promise<LoginModel>
}
