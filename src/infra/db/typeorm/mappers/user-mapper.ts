import { User, UserModel } from '@/domain/models/user'
import { UserTypeOrmEntity } from '@/infra/db/typeorm/entities/user-entity'
import { Address } from '@/domain/value-objects/address'
import { Id } from '@/domain/value-objects/id'
import { UserLogin } from '@/domain/value-objects/user-login'
import { Name } from '@/domain/value-objects/name'
import { Email } from '@/domain/value-objects/email'
import { Cpf } from '@/domain/value-objects/cpf'
import { Rg } from '@/domain/value-objects/rg'
import { UserStatus } from '@/domain/value-objects/user-status'
import { UserRole } from '@/domain/value-objects/user-role'

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

    // Map login info if available
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
}
