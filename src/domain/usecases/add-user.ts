import { UserModel } from '../models/user'

export interface AddUserParams {
  name: string
  email: string
  rg: string
  cpf: string
  dataNascimento: Date
}

export interface AddUser {
  add: (user: AddUserParams) => Promise<UserModel | Error>
}
