import { Id } from '@/domain/value-objects/id'
import { Email } from '@/domain/value-objects/email'
import { Cpf } from '@/domain/value-objects/cpf'
import { Name } from '@/domain/value-objects/name'
import { Rg } from '@/domain/value-objects/rg'
import { Address } from '@/domain/value-objects/address'
import { UserStatus } from '@/domain/value-objects/user-status'
import { UserRole } from '@/domain/value-objects/user-role'

export interface UserModel {
  id: Id
  name: Name
  email: Email
  rg: Rg
  cpf: Cpf
  gender: string
  version: number
  phone?: string
  address?: Address
  status: UserStatus
  deletedAt?: Date
  login?: {
    role: UserRole
    status: UserStatus
  }
}
