import { CreateUserLoginRepository } from '@/application/protocols/db/create-user-login-repository'
import { IsNull } from 'typeorm'
import { AddLoginRepository } from '@/application/protocols/db/add-login-repository'
import { LoadAccountByEmailRepository } from '@/application/protocols/db/load-account-by-email-repository'
import { UpdateAccessTokenRepository } from '@/application/protocols/db/update-access-token-repository'
import { CreateUserLoginParams } from '@/domain/usecases/create-user-login'
import { AddUserLoginParams } from '@/domain/usecases/add-user-login'
import { LoginModel } from '@/domain/models/login'
import { LoginTypeOrmEntity } from './entities/login-entity'
import { UserTypeOrmEntity } from './entities/user-entity'
import { TypeOrmHelper } from './typeorm-helper'
import { UserRole } from '@/domain/value-objects/user-role'
import { UserStatus, UserStatusEnum } from '@/domain/value-objects/user-status'
import { Id } from '@/domain/value-objects/id'

export class LoginTypeOrmRepository implements CreateUserLoginRepository, AddLoginRepository, LoadAccountByEmailRepository, UpdateAccessTokenRepository {
  async create(data: CreateUserLoginParams): Promise<LoginModel> {
    const repository = TypeOrmHelper.getRepository(LoginTypeOrmEntity)
    const loginEntity = repository.create({
      userId: data.userId.value,
      password: data.password,
      role: data.role.value,
      status: data.status.value
    })
    const saved = await repository.save(loginEntity)
    return this.toDomain(saved)
  }

  async add(data: AddUserLoginParams & { passwordHash: string }): Promise<LoginModel> {
    const repository = TypeOrmHelper.getRepository(LoginTypeOrmEntity)
    const loginEntity = repository.create({
      userId: data.userId.value,
      password: data.passwordHash,
      role: data.role.value,
      status: data.status.value
    })
    const saved = await repository.save(loginEntity)
    return this.toDomain(saved)
  }

  async loadByEmail(email: string): Promise<LoginModel | undefined> {
    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    const user = await userRepo.findOne({ where: { email, deletedAt: IsNull() } })

    if (user) {
      if (user.status !== UserStatusEnum.ACTIVE) {
        return undefined
      }

      const repository = TypeOrmHelper.getRepository(LoginTypeOrmEntity)
      const login = await repository.findOne({ where: { userId: user.id } })
      if (login) {
        const loginModel = this.toDomain(login)
        return { ...loginModel, name: user.name }
      }
    }
    return undefined
  }

  async updateAccessToken(id: string, token: string): Promise<void> {
    const repository = TypeOrmHelper.getRepository(LoginTypeOrmEntity)
    await repository.update({ id }, { accessToken: token })
  }

  private toDomain(entity: LoginTypeOrmEntity): LoginModel {
    return {
      id: Id.create(entity.id) as Id,
      userId: Id.create(entity.userId) as Id,
      password: entity.password,
      role: UserRole.create(entity.role ?? 'MEMBER') as UserRole,
      status: UserStatus.create(entity.status ?? 'ACTIVE') as UserStatus,
      accessToken: entity.accessToken
    }
  }
}
