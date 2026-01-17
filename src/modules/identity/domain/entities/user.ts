import { Id } from '@/shared/domain/value-objects/id'
import { Email } from '@/modules/identity/domain/value-objects/email'
import { Cpf } from '@/modules/identity/domain/value-objects/cpf'
import { Name } from '@/modules/identity/domain/value-objects/name'
import { Rg } from '@/modules/identity/domain/value-objects/rg'
import { Address } from '@/modules/identity/domain/value-objects/address'
import { UserStatus } from '@/modules/identity/domain/value-objects/user-status'

import { UserLogin } from '@/modules/identity/domain/value-objects/user-login'
import { DomainEvents } from '@/shared/domain/events/domain-events'

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
  createdAt?: Date
  deletedAt?: Date
  login?: UserLogin
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
  public readonly createdAt?: Date
  public readonly deletedAt?: Date
  public readonly login?: UserLogin

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
    this.createdAt = props.createdAt
    this.deletedAt = props.deletedAt
    this.login = props.login
  }

  static create(props: UserProps): User {
    if (!props.id) throw new Error('ID is required')
    const id = props.id
    const user = new User(props, id)

    DomainEvents.markAggregateForDispatch(user.id.value, {
      aggregateId: user.id.value,
      type: 'UserCreated',
      payload: {
        userId: user.id.value,
        email: user.email.value
      },
      createdAt: new Date()
    })

    return user
  }

  static restore(props: UserProps, id: Id): User {
    return new User(props, id)
  }

  changeAddress(address: Address): User {
    return new User({
      name: this.name,
      email: this.email,
      rg: this.rg,
      cpf: this.cpf,
      gender: this.gender,
      version: this.version,
      phone: this.phone,
      address: address,
      status: this.status,
      createdAt: this.createdAt,
      deletedAt: this.deletedAt,
      login: this.login
    }, this.id)
  }

  changeName(name: Name): User {
    return new User({
      name: name,
      email: this.email,
      rg: this.rg,
      cpf: this.cpf,
      gender: this.gender,
      version: this.version,
      phone: this.phone,
      address: this.address,
      status: this.status,
      createdAt: this.createdAt,
      deletedAt: this.deletedAt,
      login: this.login
    }, this.id)
  }
}

export type UserModel = User

