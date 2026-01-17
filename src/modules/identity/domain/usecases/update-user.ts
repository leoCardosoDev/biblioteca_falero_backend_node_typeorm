import { UserModel } from '@/modules/identity/domain/models/user'
import { Id } from '@/shared/domain/value-objects/id'
import { Email } from '@/modules/identity/domain/value-objects/email'
import { Cpf } from '@/modules/identity/domain/value-objects/cpf'
import { Name } from '@/modules/identity/domain/value-objects/name'
import { Rg } from '@/modules/identity/domain/value-objects/rg'
import { Address } from '@/modules/identity/domain/value-objects/address'
import { UserStatus } from '@/modules/identity/domain/value-objects/user-status'

export type UpdateUserParams = {
  id: Id
  name?: Name
  email?: Email
  rg?: Rg
  cpf?: Cpf
  gender?: string
  phone?: string
  address?: Address
  status?: UserStatus
  version?: number
}

export interface UpdateUser {
  update: (userData: UpdateUserParams) => Promise<UserModel | null>
}
