import { AddUserRepository } from '@/application/protocols/add-user-repository'
import { LoadUserByEmailRepository } from '@/application/protocols/db/load-user-by-email-repository'
import { LoadUserByCpfRepository } from '@/application/protocols/db/load-user-by-cpf-repository'
import { LoadUsersRepository } from '@/application/protocols/db/load-users-repository'
import { LoadUserByIdRepository } from '@/application/protocols/db/load-user-by-id-repository'
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

export class UserTypeOrmRepository implements AddUserRepository, LoadUserByEmailRepository, LoadUserByCpfRepository, LoadUsersRepository, LoadUserByIdRepository, UpdateUserRepository, DeleteUserRepository {
  private toUserModel(entity: UserTypeOrmEntity): UserModel | null {
    try {
      // Validate Name (returns Error on failure)
      const nameOrError = Name.create(entity.name)
      if (!(nameOrError instanceof Name)) {
        console.error(`[DATA CORRUPTION] Failed to reconstitute User ${entity.id}: Invalid Name - "${entity.name}"`)
        return null
      }

      // Validate Rg (returns Error on failure)
      const rgOrError = Rg.create(entity.rg)
      if (!(rgOrError instanceof Rg)) {
        console.error(`[DATA CORRUPTION] Failed to reconstitute User ${entity.id}: Invalid RG - "${entity.rg}"`)
        return null
      }

      // Validate BirthDate (returns Error on failure)
      const birthDateOrError = BirthDate.create(entity.birthDate)
      if (!(birthDateOrError instanceof BirthDate)) {
        console.error(`[DATA CORRUPTION] Failed to reconstitute User ${entity.id}: Invalid BirthDate - "${entity.birthDate}"`)
        return null
      }

      // Validate Email (throws on failure)
      const email = Email.create(entity.email)

      // Validate Cpf (throws on failure)
      const cpf = Cpf.create(entity.cpf)

      // Address is optional, handle gracefully
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
        name: nameOrError,
        email,
        rg: rgOrError,
        cpf,
        birthDate: birthDateOrError,
        address
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error(`[DATA CORRUPTION] Failed to reconstitute User ${entity.id}: ${errorMessage}`)
      return null
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
    const result = this.toUserModel(user)
    if (!result) {
      throw new Error('Failed to create user: data corruption detected after save')
    }
    return result
  }

  async loadByEmail(email: string): Promise<UserModel | undefined> {
    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    const user = await userRepo.findOne({ where: { email } })
    if (!user) return undefined
    return this.toUserModel(user) ?? undefined
  }

  async loadByCpf(cpf: string): Promise<UserModel | undefined> {
    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    const user = await userRepo.findOne({ where: { cpf } })
    if (!user) return undefined
    return this.toUserModel(user) ?? undefined
  }

  async loadAll(): Promise<UserModel[]> {
    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    const users = await userRepo.find()
    return users.map(user => this.toUserModel(user)).filter((user): user is UserModel => user !== null)
  }

  async loadById(id: string): Promise<UserModel | null> {
    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    const user = await userRepo.findOne({ where: { id } })
    if (!user) return null
    return this.toUserModel(user)
  }

  async update(userData: UpdateUserParams): Promise<UserModel | null> {
    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    const user = await userRepo.findOne({ where: { id: userData.id.value } })
    if (!user) {
      return null
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
    const result = this.toUserModel(user)
    if (!result) {
      throw new Error('Failed to update user: data corruption detected after save')
    }
    return result
  }

  async delete(id: string): Promise<void> {
    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    await userRepo.delete(id)
  }
}
