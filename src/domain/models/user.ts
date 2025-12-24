import { Id } from '@/domain/value-objects/id'
import { Email } from '@/domain/value-objects/email'
import { Cpf } from '@/domain/value-objects/cpf'

export interface UserModel {
  id: Id
  name: string
  email: Email
  rg: string
  cpf: Cpf
  dataNascimento: string
}
