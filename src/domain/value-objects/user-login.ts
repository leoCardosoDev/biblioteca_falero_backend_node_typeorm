import { UserRole } from './user-role'
import { UserStatus } from './user-status'

export type UserLoginProps = {
  role: UserRole
  status: UserStatus
}

export class UserLogin {
  public readonly role: UserRole
  public readonly status: UserStatus

  private constructor(props: UserLoginProps) {
    this.role = props.role
    this.status = props.status
  }

  static create(role: UserRole, status: UserStatus): UserLogin {
    return new UserLogin({ role, status })
  }

  static restore(role: UserRole, status: UserStatus): UserLogin {
    return new UserLogin({ role, status })
  }
}
