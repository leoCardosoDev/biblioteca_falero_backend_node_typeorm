import { UserModel } from '@/domain/models/user'
import { Email } from '@/domain/value-objects/email'
import { Cpf } from '@/domain/value-objects/cpf'

export interface AddUserParams {
  name: string
  email: Email
  rg: string
  cpf: Cpf
  dataNascimento: string
}

export interface AddUser {
  add: (user: AddUserParams) => Promise<UserModel | Error>
}
