import { AddUserOutput } from './add-user-output'
import { Id } from '@/shared/domain/value-objects/id'
import { Email } from '@/modules/identity/domain/value-objects/email'
import { Cpf } from '@/modules/identity/domain/value-objects/cpf'
import { Name } from '@/modules/identity/domain/value-objects/name'
import { Rg } from '@/modules/identity/domain/value-objects/rg'
import { Address } from '@/modules/identity/domain/value-objects/address'
import { UserStatus } from '@/modules/identity/domain/value-objects/user-status'

export type AddUserAddressInput = {
  street: string
  number: string
  complement?: string
  zipCode: string
  neighborhoodId?: string
  neighborhood?: string
  cityId?: string
  city?: string
  stateId?: string
  state?: string
}

export interface AddUserParams {
  name: Name
  email: Email
  password?: string
  rg: Rg
  cpf: Cpf
  gender: string
  phone?: string
  address?: AddUserAddressInput
  status: UserStatus
}

export interface AddUserRepoParams {
  id: Id
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
  add: (user: AddUserParams) => Promise<AddUserOutput | Error>
}

