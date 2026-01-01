import { UserModel } from '@/domain/models/user'
import { Id } from '@/domain/value-objects/id'
import { Email } from '@/domain/value-objects/email'
import { Cpf } from '@/domain/value-objects/cpf'
import { Name } from '@/domain/value-objects/name'
import { Rg } from '@/domain/value-objects/rg'
import { Address } from '@/domain/value-objects/address'

export type UpdateUserParams = {
  id: Id
  name?: Name
  email?: Email
  rg?: Rg
  cpf?: Cpf
  gender?: string
  phone?: string
  address?: Address
}

export interface UpdateUser {
  update: (userData: UpdateUserParams) => Promise<UserModel | null>
}
