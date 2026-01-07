import { Id } from '@/domain/value-objects/id'
import { Email } from '@/domain/value-objects/email'
import { Cpf } from '@/domain/value-objects/cpf'
import { Name } from '@/domain/value-objects/name'
import { Rg } from '@/domain/value-objects/rg'
import { Address } from '@/domain/value-objects/address'
import { UserStatus } from '@/domain/value-objects/user-status'
import { UserRole } from '@/domain/value-objects/user-role'
import { DomainEvents } from '@/domain/events/domain-events'

export type UserProps = {
  id?: Id
  name: Name
  email: Email
  rg: Rg
  cpf: Cpf
  gender: string
  version?: number
  phone?: string
  address?: Address
  status: UserStatus
  deletedAt?: Date
  login?: {
    role: UserRole
    status: UserStatus
  }
}

export class User {
  public readonly id: Id
  public readonly name: Name
  public readonly email: Email
  public readonly rg: Rg
  public readonly cpf: Cpf
  public readonly gender: string
  public readonly version: number
  public readonly phone?: string
  public readonly address?: Address
  public readonly status: UserStatus
  public readonly deletedAt?: Date
  public readonly login?: {
    role: UserRole
    status: UserStatus
  }

  private constructor(props: UserProps, id: Id) {
    this.id = id
    this.name = props.name
    this.email = props.email
    this.rg = props.rg
    this.cpf = props.cpf
    this.gender = props.gender
    this.version = props.version ?? 0
    this.phone = props.phone
    this.address = props.address
    this.status = props.status
    this.deletedAt = props.deletedAt
    this.login = props.login
  }

  static create(props: UserProps): User {
    const id = props.id ?? Id.generate()
    const user = new User(props, id)

    const isNewUser = !props.id 
    if (isNewUser) {
      DomainEvents.markAggregateForDispatch(user.id.value, {
        aggregateId: user.id.value,
        type: 'UserCreated',
        payload: {
          userId: user.id.value,
          email: user.email.value
        },
        createdAt: new Date()
      })
    }

    return user
  }

  static restore(props: UserProps, id: Id): User {
    return new User(props, id)
  }
}

export type UserModel = User

