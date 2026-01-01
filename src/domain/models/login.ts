import { Id } from '@/domain/value-objects/id'
import { UserRole } from '@/domain/value-objects/user-role'
import { UserStatus } from '@/domain/value-objects/user-status'

export type LoginModel = {
  id: Id
  userId: Id
  password: string
  role: UserRole
  status: UserStatus
  accessToken?: string
  name?: string
}
