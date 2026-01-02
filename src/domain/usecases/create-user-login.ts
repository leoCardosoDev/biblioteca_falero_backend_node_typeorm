import { LoginModel } from '@/domain/models/login'
import { Id } from '@/domain/value-objects/id'
import { UserRole } from '@/domain/value-objects/user-role'
import { UserStatus } from '@/domain/value-objects/user-status'
import { Email } from '@/domain/value-objects/email'

export interface CreateUserLoginParams {
  userId: Id
  email: Email
  password: string
  role: UserRole
  status: UserStatus
}

export interface CreateUserLogin {
  create: (params: CreateUserLoginParams) => Promise<LoginModel>
}
