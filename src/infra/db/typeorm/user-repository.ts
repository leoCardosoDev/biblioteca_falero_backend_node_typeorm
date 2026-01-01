import { AddUserRepository } from '@/application/protocols/add-user-repository'
import { IsNull } from 'typeorm'
import { LoadUserByEmailRepository } from '@/application/protocols/db/load-user-by-email-repository'
import { LoadUserByCpfRepository } from '@/application/protocols/db/load-user-by-cpf-repository'
import { LoadUsersRepository } from '@/application/protocols/db/load-users-repository'
import { LoadUserByIdRepository } from '@/application/protocols/db/load-user-by-id-repository'
import { UpdateUserRepository } from '@/application/protocols/db/update-user-repository'
import { DeleteUserRepository } from '@/application/protocols/db/delete-user-repository'
import { UserWithLogin } from '@/domain/usecases/load-users'
import { UserRole } from '@/domain/value-objects/user-role'
import { UserStatus, UserStatusEnum } from '@/domain/value-objects/user-status'
import { AddUserParams } from '@/domain/usecases/add-user'
import { UpdateUserParams } from '@/domain/usecases/update-user'
import { UserModel } from '@/domain/models/user'
import { TypeOrmHelper } from '@/infra/db/typeorm/typeorm-helper'
import { UserTypeOrmEntity } from '@/infra/db/typeorm/entities/user-entity'
import { LoginTypeOrmEntity } from '@/infra/db/typeorm/entities/login-entity'
import { Id } from '@/domain/value-objects/id'
import { Email } from '@/domain/value-objects/email'
import { Cpf } from '@/domain/value-objects/cpf'
import { Name } from '@/domain/value-objects/name'
import { Rg } from '@/domain/value-objects/rg'
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


      // Validate Email (throws on failure)
      const email = Email.create(entity.email)

      // Validate Cpf (throws on failure)
      const cpf = Cpf.create(entity.cpf)

      let address: Address | undefined
      if (entity.addressStreet && entity.addressNumber && entity.addressNeighborhoodId && entity.addressCityId && entity.addressZipCode) {
        const addressResult = Address.create({
          street: entity.addressStreet,
          number: entity.addressNumber,
          complement: entity.addressComplement,
          neighborhoodId: entity.addressNeighborhoodId,
          cityId: entity.addressCityId,
          zipCode: entity.addressZipCode
        })
        if (addressResult instanceof Address) {
          address = addressResult
        }
      }

      const statusOrError = UserStatus.create(entity.status)
      if (statusOrError instanceof Error) {
        console.error(`[DATA CORRUPTION] Failed to reconstitute User ${entity.id}: Invalid Status - "${entity.status}"`)
        return null
      }

      return {
        id: Id.create(entity.id),
        name: nameOrError,
        email,
        rg: rgOrError,
        cpf,
        gender: entity.gender,
        phone: entity.phone,
        address,
        status: statusOrError,
        deletedAt: entity.deletedAt,
        version: 1 // Assuming versioning logic or default
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
      gender: data.gender,
      phone: data.phone,
      addressStreet: data.address?.street,
      addressNumber: data.address?.number,
      addressComplement: data.address?.complement,
      addressNeighborhoodId: data.address?.neighborhoodId,
      addressCityId: data.address?.cityId,
      addressZipCode: data.address?.zipCode,
      status: data.status.value // Ensure status is saved as string
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
    const user = await userRepo.findOne({ where: { email, deletedAt: IsNull() } })
    if (!user) return undefined
    return this.toUserModel(user) ?? undefined
  }

  async loadByCpf(cpf: string): Promise<UserModel | undefined> {
    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    const user = await userRepo.findOne({ where: { cpf, deletedAt: IsNull() } })
    if (!user) return undefined
    return this.toUserModel(user) ?? undefined
  }

  async loadAll(): Promise<UserWithLogin[]> {
    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)

    const users = await userRepo.createQueryBuilder('user')
      .leftJoinAndMapOne('user.tempLogin', LoginTypeOrmEntity, 'login', 'login.userId = user.id')
      .where('user.deletedAt IS NULL')
      .getMany()

    const usersWithLogin: UserWithLogin[] = []

    for (const user of users) {
      const userModel = this.toUserModel(user)
      if (userModel) {
        const loginEntity = (user as unknown as Record<string, unknown>).tempLogin as LoginTypeOrmEntity | undefined

        let loginVO: { role: UserRole, status: UserStatus } | undefined

        if (loginEntity && loginEntity.role && loginEntity.status) {
          const roleOrError = UserRole.create(loginEntity.role)
          const statusOrError = UserStatus.create(loginEntity.status)

          if (!(roleOrError instanceof Error) && !(statusOrError instanceof Error)) {
            loginVO = {
              role: roleOrError,
              status: statusOrError
            }
          }
        }

        usersWithLogin.push({
          ...userModel,
          login: loginVO
        })
      }
    }
    return usersWithLogin
  }

  async loadById(id: string): Promise<UserWithLogin | null> {
    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    const loginRepo = TypeOrmHelper.getRepository(LoginTypeOrmEntity)
    const userEntity = await userRepo.findOne({ where: { id, deletedAt: IsNull() } })
    if (!userEntity) return null

    const loginEntity = await loginRepo.findOne({ where: { userId: id } })
    const userModel = this.toUserModel(userEntity)
    if (!userModel) return null

    return {
      ...userModel,
      login: loginEntity ? {
        role: UserRole.create(loginEntity.role!) as UserRole,
        status: UserStatus.create(loginEntity.status!) as UserStatus
      } : undefined
    }
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
    if (userData.gender) user.gender = userData.gender
    if (userData.phone) user.phone = userData.phone
    if (userData.address) {
      user.addressStreet = userData.address.street
      user.addressNumber = userData.address.number
      user.addressComplement = userData.address.complement
      user.addressNeighborhoodId = userData.address.neighborhoodId
      user.addressCityId = userData.address.cityId
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
    await userRepo.update(id, { deletedAt: new Date(), status: UserStatusEnum.INACTIVE })
  }
}
