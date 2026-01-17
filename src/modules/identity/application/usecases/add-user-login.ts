import { LoginModel } from '@/modules/identity/domain/models/login'
import { Id } from '@/shared/domain/value-objects/id'
import { UserRole } from '@/modules/identity/domain/value-objects/user-role'
import { UserStatus } from '@/modules/identity/domain/value-objects/user-status'
import { Email } from '@/modules/identity/domain/value-objects/email'
import { Password } from '@/modules/identity/domain/value-objects/password'

export interface AddUserLoginParams {
  actorId: Id
  userId: Id
  email: Email
  password: Password
  role?: UserRole
  status?: UserStatus
}

export interface AddUserLogin {
  add: (data: AddUserLoginParams) => Promise<LoginModel>
}
