import { TypeOrmHelper } from '@/infra/db/typeorm/typeorm-helper'
import { UserTypeOrmEntity } from '@/infra/db/typeorm/entities/user-entity'
import { UserMapper } from '@/infra/db/typeorm/mappers/user-mapper'

import { AddUserRepository } from '@/application/protocols/add-user-repository'
import { LoadUserByEmailRepository } from '@/application/protocols/db/load-user-by-email-repository'
import { LoadUserByCpfRepository } from '@/application/protocols/db/load-user-by-cpf-repository'
import { LoadUsersRepository } from '@/application/protocols/db/load-users-repository'
import { LoadUserByIdRepository } from '@/application/protocols/db/load-user-by-id-repository'
import { UpdateUserRepository } from '@/application/protocols/db/update-user-repository'
import { UpdateUserStatusRepository } from '@/application/protocols/db/update-user-status-repository'
import { DeleteUserRepository } from '@/application/protocols/db/delete-user-repository'

import { AddUserRepoParams } from '@/domain/usecases/add-user'
import { UpdateUserParams } from '@/domain/usecases/update-user'
import { UserModel } from '@/domain/models/user'
import { UserStatus } from '@/domain/value-objects/user-status'
import { UserStatusEnum } from '@/domain/value-objects/user-status'


export class UserTypeOrmRepository implements AddUserRepository, LoadUserByEmailRepository, LoadUserByCpfRepository, LoadUsersRepository, LoadUserByIdRepository, UpdateUserRepository, DeleteUserRepository, UpdateUserStatusRepository {


  async add(data: AddUserRepoParams): Promise<UserModel> {
    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    const user = userRepo.create({
      id: data.id.value,
      name: data.name.value,
      email: data.email.value,
      rg: data.rg.value,
      cpf: data.cpf.value,
      gender: data.gender,
      phone: data.phone,
      addressStreet: data.address?.street,
      addressNumber: data.address?.number,
      addressComplement: data.address?.complement,
      addressNeighborhoodId: data.address?.neighborhoodId?.value,
      addressCityId: data.address?.cityId?.value,
      addressStateId: data.address?.stateId?.value,
      addressZipCode: data.address?.zipCode,
      status: data.status.value
    })
    await userRepo.save(user)
    return UserMapper.toDomain(user)
  }
  async loadByEmail(email: string): Promise<UserModel | undefined> {
    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    const user = await userRepo.findOne({
      where: { email },
      relations: ['logins', 'logins.role', 'addressNeighborhood', 'addressCity', 'addressState']
    })
    if (!user) {
      return undefined
    }
    return UserMapper.toDomain(user)
  }

  async loadByCpf(cpf: string): Promise<UserModel | undefined> {
    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    const user = await userRepo.findOne({
      where: { cpf },
      relations: ['logins', 'logins.role', 'addressNeighborhood', 'addressCity', 'addressState']
    })
    if (!user) {
      return undefined
    }
    return UserMapper.toDomain(user)
  }

  async loadAll(): Promise<UserModel[]> {
    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    const users = await userRepo.find({
      relations: ['logins', 'logins.role', 'addressNeighborhood', 'addressCity', 'addressState']
    })

    const userModels: UserModel[] = []
    for (const user of users) {
      try {
        userModels.push(UserMapper.toDomain(user))
      } catch (_error) {
        continue
      }

    }
    return userModels
  }

  async loadById(id: string): Promise<UserModel | null> {
    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    const user = await userRepo.findOne({
      where: { id },
      relations: ['logins', 'logins.role', 'addressNeighborhood', 'addressCity', 'addressState']
    })
    if (!user) {
      return null
    }
    return UserMapper.toDomain(user)
  }

  async update(userData: UpdateUserParams): Promise<UserModel | null> {
    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    const userEntity = await userRepo.findOne({ where: { id: userData.id.value } })
    if (!userEntity) {
      return null
    }

    if (userData.version !== undefined && userEntity.version !== userData.version) {
      throw new Error('OptimisticLockError: version mismatch')
    }
    if (userData.name) userEntity.name = userData.name.value
    if (userData.email) userEntity.email = userData.email.value
    if (userData.rg) userEntity.rg = userData.rg.value
    if (userData.cpf) userEntity.cpf = userData.cpf.value
    if (userData.gender) userEntity.gender = userData.gender
    if (userData.phone) userEntity.phone = userData.phone
    if (userData.address) {
      userEntity.addressStreet = userData.address.street
      userEntity.addressNumber = userData.address.number
      userEntity.addressComplement = userData.address.complement
      userEntity.addressNeighborhoodId = userData.address.neighborhoodId?.value
      userEntity.addressCityId = userData.address.cityId?.value
      userEntity.addressStateId = userData.address.stateId?.value
      userEntity.addressZipCode = userData.address.zipCode
    }
    if (userData.status) userEntity.status = userData.status.value

    await userRepo.save(userEntity)
    const updatedUser = await userRepo.findOne({
      where: { id: userEntity.id },
      relations: ['logins', 'logins.role', 'addressNeighborhood', 'addressCity', 'addressState']
    })
    return UserMapper.toDomain(updatedUser!)
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
