import { Id } from '@/domain/value-objects/id'
import { Email } from '@/domain/value-objects/email'

export type LoginProps = {
  id?: Id
  userId: Id
  roleId: Id
  email: Email
  passwordHash: string
  isActive?: boolean
}

export class Login {
  private constructor(
    public readonly id: Id,
    public readonly userId: Id,
    public readonly roleId: Id,
    public readonly email: Email,
    public readonly passwordHash: string,
    public readonly isActive: boolean
  ) { }

  static create(props: LoginProps): Login {
    return new Login(
      props.id ?? Id.generate(),
      props.userId,
      props.roleId,
      props.email,
      props.passwordHash,
      props.isActive ?? true
    )
  }
}

export type LoginModel = Login
