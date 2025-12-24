import { UserModel } from '@/domain/models/user'
import { Email } from '@/domain/value-objects/email'
import { Cpf } from '@/domain/value-objects/cpf'
import { Name } from '@/domain/value-objects/name'
import { Rg } from '@/domain/value-objects/rg'
import { BirthDate } from '@/domain/value-objects/birth-date'
import { Address } from '@/domain/value-objects/address'

export interface AddUserParams {
  name: Name
  email: Email
  rg: Rg
  cpf: Cpf
  birthDate: BirthDate
  address?: Address
}

export interface AddUser {
  add: (user: AddUserParams) => Promise<UserModel | Error>
}
