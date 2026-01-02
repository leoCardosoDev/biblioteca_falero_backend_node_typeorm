import { AddLoginRepository } from '@/application/protocols/db/add-login-repository'
import { LoadAccountByEmailRepository } from '@/application/protocols/db/load-account-by-email-repository'
import { UpdateAccessTokenRepository } from '@/application/protocols/db/update-access-token-repository'
import { AddUserLoginParams } from '@/domain/usecases/add-user-login'
import { Login, LoginModel } from '@/domain/models/login'
import { LoginTypeOrmEntity } from './entities/login-entity'
import { UserTypeOrmEntity } from './entities/user-entity'
import { TypeOrmHelper } from './typeorm-helper'
import { Id } from '@/domain/value-objects/id'
import { IsNull } from 'typeorm'
import { Email } from '@/domain/value-objects/email'
import { UserStatusEnum } from '@/domain/value-objects/user-status'

export class LoginTypeOrmRepository implements AddLoginRepository, LoadAccountByEmailRepository, UpdateAccessTokenRepository {

  async add(data: Omit<AddUserLoginParams, 'role'> & { passwordHash: string, roleId: Id }): Promise<LoginModel> {
    const repository = TypeOrmHelper.getRepository(LoginTypeOrmEntity)
    const loginEntity = repository.create({
      userId: data.userId.value,
      password: data.passwordHash,
      roleId: data.roleId.value,
      status: data.status.value,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    const saved = await repository.save(loginEntity)
    // We need email to return Domain Login. 'data' has email.
    return this.toDomain(saved, data.email)
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
        return this.toDomain(login, Email.create(user.email))
      }
    }
    return undefined
  }

  async updateAccessToken(id: string, token: string): Promise<void> {
    const repository = TypeOrmHelper.getRepository(LoginTypeOrmEntity)
    await repository.update({ id }, { accessToken: token })
  }

  private toDomain(entity: LoginTypeOrmEntity, email: Email): Login {
    return Login.create({
      id: Id.create(entity.id),
      userId: Id.create(entity.userId),
      roleId: entity.roleId ? Id.create(entity.roleId) : Id.generate(), // Should have roleId
      email: email,
      passwordHash: entity.password,
      isActive: entity.status === 'ACTIVE' // basic mapping
    })
  }
}
