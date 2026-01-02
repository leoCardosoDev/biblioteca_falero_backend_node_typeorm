import { UserModel } from '@/domain/models/user'
import { Email } from '@/domain/value-objects/email'
import { Cpf } from '@/domain/value-objects/cpf'
import { Name } from '@/domain/value-objects/name'
import { Rg } from '@/domain/value-objects/rg'
import { Address } from '@/domain/value-objects/address'
import { UserStatus } from '@/domain/value-objects/user-status'

export interface AddUserParams {
  name: Name
  email: Email
  rg: Rg
  cpf: Cpf
  gender: string
  phone?: string
  address?: Address
  status: UserStatus
}

export interface AddUser {
  add: (user: AddUserParams) => Promise<UserModel | Error>
}
