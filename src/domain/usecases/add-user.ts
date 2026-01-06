import { UserModel } from '@/domain/models/user'
import { Id } from '@/domain/value-objects/id'
import { Email } from '@/domain/value-objects/email'
import { Cpf } from '@/domain/value-objects/cpf'
import { Name } from '@/domain/value-objects/name'
import { Rg } from '@/domain/value-objects/rg'
import { Address } from '@/domain/value-objects/address'
import { UserStatus } from '@/domain/value-objects/user-status'

// Input for UseCase
export type AddUserAddressInput = {
  street: string
  number: string
  complement?: string
  zipCode: string
  neighborhoodId?: string
  neighborhood?: string // Name for resolution
  cityId?: string
  city?: string // Name for resolution
  state?: string // UF for resolution
}

export interface AddUserParams {
  name: string
  email: string
  rg: string
  cpf: string
  gender: string
  phone?: string
  address?: AddUserAddressInput
  status: string
}

// Input for Repository (Strict)
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
  add: (user: AddUserParams) => Promise<UserModel | Error>
}
