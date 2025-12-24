import { AddUserRepository } from '@/application/protocols/add-user-repository'
import { LoadUserByEmailRepository } from '@/application/protocols/db/load-user-by-email-repository'
import { LoadUserByCpfRepository } from '@/application/protocols/db/load-user-by-cpf-repository'
import { LoadUsersRepository } from '@/application/protocols/db/load-users-repository'
import { UpdateUserRepository } from '@/application/protocols/db/update-user-repository'
import { DeleteUserRepository } from '@/application/protocols/db/delete-user-repository'
import { AddUserParams } from '@/domain/usecases/add-user'
import { UpdateUserParams } from '@/domain/usecases/update-user'
import { UserModel } from '@/domain/models/user'
import { TypeOrmHelper } from '@/infra/db/typeorm/typeorm-helper'
import { UserTypeOrmEntity } from '@/infra/db/typeorm/entities/user-entity'
import { Id } from '@/domain/value-objects/id'
import { Email } from '@/domain/value-objects/email'
import { Cpf } from '@/domain/value-objects/cpf'
import { Name } from '@/domain/value-objects/name'
import { Rg } from '@/domain/value-objects/rg'
import { BirthDate } from '@/domain/value-objects/birth-date'
import { Address } from '@/domain/value-objects/address'

export class UserTypeOrmRepository implements AddUserRepository, LoadUserByEmailRepository, LoadUserByCpfRepository, LoadUsersRepository, UpdateUserRepository, DeleteUserRepository {
  private toUserModel(entity: UserTypeOrmEntity): UserModel {
    let address: Address | undefined
    if (entity.addressStreet && entity.addressNumber && entity.addressNeighborhood && entity.addressCity && entity.addressState && entity.addressZipCode) {
      const addressResult = Address.create({
        street: entity.addressStreet,
        number: entity.addressNumber,
        complement: entity.addressComplement,
        neighborhood: entity.addressNeighborhood,
        city: entity.addressCity,
        state: entity.addressState,
        zipCode: entity.addressZipCode
      })
      if (addressResult instanceof Address) {
        address = addressResult
      }
    }
    return {
      id: Id.create(entity.id),
      name: Name.create(entity.name) as Name,
      email: Email.create(entity.email),
      rg: Rg.create(entity.rg) as Rg,
      cpf: Cpf.create(entity.cpf),
      birthDate: BirthDate.create(entity.birthDate) as BirthDate,
      address
    }
  }

  async add(data: AddUserParams): Promise<UserModel> {
    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    const user = userRepo.create({
      name: data.name.value,
      email: data.email.value,
      rg: data.rg.value,
      cpf: data.cpf.value,
      birthDate: data.birthDate.value,
      addressStreet: data.address?.street,
      addressNumber: data.address?.number,
      addressComplement: data.address?.complement,
      addressNeighborhood: data.address?.neighborhood,
      addressCity: data.address?.city,
      addressState: data.address?.state,
      addressZipCode: data.address?.zipCode
    })
    await userRepo.save(user)
    return this.toUserModel(user)
  }

  async loadByEmail(email: string): Promise<UserModel | undefined> {
    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    const user = await userRepo.findOne({ where: { email } })
    if (!user) return undefined
    return this.toUserModel(user)
  }

  async loadByCpf(cpf: string): Promise<UserModel | undefined> {
    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    const user = await userRepo.findOne({ where: { cpf } })
    if (!user) return undefined
    return this.toUserModel(user)
  }

  async loadAll(): Promise<UserModel[]> {
    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    const users = await userRepo.find()
    return users.map(user => this.toUserModel(user))
  }

  async update(userData: UpdateUserParams): Promise<UserModel> {
    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    const user = await userRepo.findOne({ where: { id: userData.id.value } })
    if (!user) {
      throw new Error('User not found')
    }
    if (userData.name) user.name = userData.name.value
    if (userData.email) user.email = userData.email.value
    if (userData.rg) user.rg = userData.rg.value
    if (userData.cpf) user.cpf = userData.cpf.value
    if (userData.birthDate) user.birthDate = userData.birthDate.value
    if (userData.address) {
      user.addressStreet = userData.address.street
      user.addressNumber = userData.address.number
      user.addressComplement = userData.address.complement
      user.addressNeighborhood = userData.address.neighborhood
      user.addressCity = userData.address.city
      user.addressState = userData.address.state
      user.addressZipCode = userData.address.zipCode
    }

    await userRepo.save(user)
    return this.toUserModel(user)
  }

  async delete(id: string): Promise<void> {
    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    await userRepo.delete(id)
  }
}
