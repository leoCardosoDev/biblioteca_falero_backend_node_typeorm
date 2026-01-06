import { AddUserRepository } from '@/application/protocols/add-user-repository'
import { IsNull } from 'typeorm'
import { LoadUserByEmailRepository } from '@/application/protocols/db/load-user-by-email-repository'
import { LoadUserByCpfRepository } from '@/application/protocols/db/load-user-by-cpf-repository'
import { LoadUsersRepository } from '@/application/protocols/db/load-users-repository'
import { LoadUserByIdRepository } from '@/application/protocols/db/load-user-by-id-repository'
import { UpdateUserRepository } from '@/application/protocols/db/update-user-repository'
import { UpdateUserStatusRepository } from '@/application/protocols/db/update-user-status-repository'
import { DeleteUserRepository } from '@/application/protocols/db/delete-user-repository'
import { UserWithLogin } from '@/domain/usecases/load-users'
import { AddUserParams } from '@/domain/usecases/add-user'
import { UpdateUserParams } from '@/domain/usecases/update-user'
import { User, UserModel } from '@/domain/models/user'
import { TypeOrmHelper } from '@/infra/db/typeorm/typeorm-helper'
import { UserTypeOrmEntity } from '@/infra/db/typeorm/entities/user-entity'
import { LoginTypeOrmEntity } from '@/infra/db/typeorm/entities/login-entity'
import { Id, Email, Cpf, Name, Rg, Address, UserRole, UserStatus, UserStatusEnum } from '@/domain/value-objects'

export class UserTypeOrmRepository implements AddUserRepository, LoadUserByEmailRepository, LoadUserByCpfRepository, LoadUsersRepository, LoadUserByIdRepository, UpdateUserRepository, DeleteUserRepository, UpdateUserStatusRepository {
  private toUserModel(entity: UserTypeOrmEntity): UserModel {
    // console.log('Converting entity:', entity.name)
    let address: Address | undefined
    if (entity.addressStreet && entity.addressNumber && entity.addressNeighborhoodId && entity.addressCityId && entity.addressZipCode) {
      // console.log('Restoring address')
      address = Address.restore({
        street: entity.addressStreet,
        number: entity.addressNumber,
        complement: entity.addressComplement,
        neighborhoodId: entity.addressNeighborhoodId,
        cityId: entity.addressCityId,
        zipCode: entity.addressZipCode
      })
    }

    // console.log('Restoring ID')
    const id = Id.restore(entity.id)

    // console.log('Restoring User')
    return User.restore({
      id,
      name: Name.restore(entity.name),
      email: Email.restore(entity.email),
      rg: Rg.restore(entity.rg),
      cpf: Cpf.restore(entity.cpf),
      gender: entity.gender,
      phone: entity.phone,
      address,
      status: UserStatus.restore(entity.status),
      deletedAt: entity.deletedAt,
      version: entity.version
    }, id)
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
    return this.toUserModel(user)
  }

  async loadByEmail(email: string): Promise<UserModel | undefined> {
    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    const user = await userRepo.findOne({ where: { email, deletedAt: IsNull() } })
    if (!user) return undefined
    return this.toUserModel(user)
  }

  async loadByCpf(cpf: string): Promise<UserModel | undefined> {
    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    const user = await userRepo.findOne({ where: { cpf, deletedAt: IsNull() } })
    if (!user) return undefined
    return this.toUserModel(user)
  }

  async loadAll(): Promise<UserWithLogin[]> {
    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)

    const users = await userRepo.createQueryBuilder('user')
      .leftJoinAndSelect('user.logins', 'login')
      .leftJoinAndSelect('login.role', 'loginRole')
      .where('user.deletedAt IS NULL')
      .getMany()

    const usersWithLogin: UserWithLogin[] = []

    for (const user of users) {
      const userModel = this.toUserModel(user)

      const loginEntity = (user as unknown as { logins: LoginTypeOrmEntity[] }).logins?.[0]

      let loginVO: { role: UserRole, status: UserStatus } | undefined

      if (loginEntity && loginEntity.role && loginEntity.status) {
        loginVO = {
          role: UserRole.restore(loginEntity.role.slug),
          status: UserStatus.restore(loginEntity.status)
        }
      }

      usersWithLogin.push({
        ...userModel,
        login: loginVO
      })
    }
    return usersWithLogin
  }

  async loadById(id: string): Promise<UserWithLogin | null> {
    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    const loginRepo = TypeOrmHelper.getRepository(LoginTypeOrmEntity)
    const userEntity = await userRepo.findOne({ where: { id, deletedAt: IsNull() } })
    if (!userEntity) return null

    const loginEntity = await loginRepo.findOne({ where: { userId: id }, relations: ['role'] })
    const userModel = this.toUserModel(userEntity)

    return {
      ...userModel,
      login: loginEntity && loginEntity.role ? {
        role: UserRole.restore(loginEntity.role.slug),
        status: UserStatus.restore(loginEntity.status!)
      } : undefined
    }
  }

  async update(userData: UpdateUserParams): Promise<UserModel | null> {
    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    const user = await userRepo.findOne({ where: { id: userData.id.value } })
    if (!user) {
      return null
    }
    // Manual version check before saving (Fallback for when save() doesn't throw in specific driver configurations)
    if (userData.version !== undefined && user.version !== userData.version) {
      throw new Error('OptimisticLockError: version mismatch')
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
    return this.toUserModel(user)
  }

  async delete(id: string): Promise<void> {
    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    await userRepo.update(id, { deletedAt: new Date(), status: UserStatusEnum.INACTIVE })
  }

  async updateStatus(userId: string, status: UserStatus): Promise<void> {
    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    await userRepo.update(userId, { status: status.value })
  }
}
