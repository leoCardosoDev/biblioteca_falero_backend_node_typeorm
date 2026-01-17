import { User, UserModel } from '@/modules/identity/domain/models/user'
import { UserTypeOrmEntity } from '../entities/user-entity'
import { Address } from '@/modules/identity/domain/value-objects/address'
import { Id } from '@/shared/domain/value-objects/id'
import { UserLogin } from '@/modules/identity/domain/value-objects/user-login'
import { Name } from '@/modules/identity/domain/value-objects/name'
import { Email } from '@/modules/identity/domain/value-objects/email'
import { Cpf } from '@/modules/identity/domain/value-objects/cpf'
import { Rg } from '@/modules/identity/domain/value-objects/rg'
import { UserStatus } from '@/modules/identity/domain/value-objects/user-status'
import { UserRole } from '@/modules/identity/domain/value-objects/user-role'

export type UserDTO = {
  id: string
  name: string
  email: string
  rg: string
  cpf: string
  gender: string
  phone: string
  status: string
  version: number
  createdAt?: string
  address?: {
    street: string
    number: string
    complement?: string
    neighborhoodId: string
    neighborhood?: string
    cityId: string
    city?: string
    stateId: string
    state?: string
    zipCode: string
  }
  login?: {
    role: string
    status: string
  }
}

export class UserMapper {
  static toDomain(entity: UserTypeOrmEntity): UserModel {
    let address: Address | undefined
    if (entity.addressStreet && entity.addressNumber && entity.addressNeighborhoodId && entity.addressCityId && entity.addressStateId && entity.addressZipCode) {
      address = Address.restore({
        street: entity.addressStreet,
        number: entity.addressNumber,
        complement: entity.addressComplement,
        neighborhoodId: Id.restore(entity.addressNeighborhoodId),
        neighborhood: entity.addressNeighborhood?.name,
        cityId: Id.restore(entity.addressCityId),
        city: entity.addressCity?.name,
        stateId: Id.restore(entity.addressStateId),
        state: entity.addressState?.uf,
        zipCode: entity.addressZipCode
      })
    }

    const id = Id.restore(entity.id)


    let login: UserModel['login']
    const firstLogin = entity.logins?.[0] as { role?: { slug?: string }, status?: string } | undefined
    if (firstLogin) {
      login = UserLogin.restore(
        UserRole.restore(firstLogin.role?.slug ?? 'USER'),
        UserStatus.restore(firstLogin.status ?? 'ACTIVE')
      )
    }

    return User.restore({
      name: Name.restore(entity.name),
      email: Email.restore(entity.email),
      rg: Rg.restore(entity.rg),
      cpf: Cpf.restore(entity.cpf),
      gender: entity.gender,
      phone: entity.phone,
      address,
      status: UserStatus.restore(entity.status),
      createdAt: entity.createdAt,
      deletedAt: entity.deletedAt,
      version: entity.version,
      login
    }, id)
  }

  static toDTO(user: UserModel): UserDTO {
    return {
      id: user.id.value,
      name: user.name.value,
      email: user.email.value,
      rg: user.rg.value,
      cpf: user.cpf.value,
      gender: user.gender,
      phone: user.phone,
      status: user.status.value,
      version: user.version,
      createdAt: user.createdAt?.toISOString(),
      address: user.address ? {
        street: user.address.street,
        number: user.address.number,
        complement: user.address.complement,
        neighborhoodId: user.address.neighborhoodId.value,
        neighborhood: user.address.neighborhood,
        cityId: user.address.cityId.value,
        city: user.address.city,
        stateId: user.address.stateId.value,
        state: user.address.state,
        zipCode: user.address.zipCode
      } : undefined,
      login: user.login ? {
        role: user.login.role.value,
        status: user.login.status.value
      } : undefined
    }
  }
}
