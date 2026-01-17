import { AddLoginRepository } from '@/modules/identity/application/protocols/db/add-login-repository'
import { LoadAccountByEmailRepository } from '@/modules/identity/application/protocols/db/load-account-by-email-repository'
import { UpdateAccessTokenRepository } from '@/modules/identity/application/protocols/db/update-access-token-repository'
import { AddUserLoginParams } from '@/modules/identity/application/usecases/add-user-login'
import { Login, LoginModel } from '@/modules/identity/domain/entities/login'
import { LoginTypeOrmEntity } from '../entities/login-entity'
import { UserTypeOrmEntity } from '../entities/user-entity'
import { TypeOrmHelper } from '@/shared/infra/db/typeorm/typeorm-helper'
import { Id } from '@/shared/domain/value-objects/id'
import { IsNull } from 'typeorm'
import { Email } from '@/modules/identity/domain/value-objects/email'
import { UserStatusEnum } from '@/modules/identity/domain/value-objects/user-status'

import { LoadLoginByUserIdRepository } from '@/modules/identity/application/protocols/db/load-login-by-user-id-repository'
import { UpdateLoginRoleRepository } from '@/modules/identity/application/protocols/db/update-login-role-repository'
import { UpdateLoginPasswordRepository } from '@/modules/identity/application/protocols/db/update-login-password-repository'
import { UpdateLoginStatusRepository } from '@/modules/identity/application/protocols/db/update-login-status-repository'

export class LoginTypeOrmRepository implements AddLoginRepository, LoadAccountByEmailRepository, UpdateAccessTokenRepository, LoadLoginByUserIdRepository, UpdateLoginRoleRepository, UpdateLoginPasswordRepository, UpdateLoginStatusRepository {

  async add(data: Omit<AddUserLoginParams, 'role' | 'actorId'> & { passwordHash: string, roleId: Id }): Promise<LoginModel> {
    const repository = TypeOrmHelper.getRepository(LoginTypeOrmEntity)
    const loginEntity = repository.create({
      userId: data.userId.value,
      password: data.passwordHash,
      roleId: data.roleId.value,
      status: data.status?.value ?? 'INACTIVE',
      createdAt: new Date(),
      updatedAt: new Date()
    })
    const saved = await repository.save(loginEntity)

    const result = this.toDomain(saved, data.email)
    if (!result) {
      throw new Error('Failed to create login: data corruption detected after save')
    }
    return result
  }

  async loadByEmail(email: string): Promise<LoginModel | undefined> {
    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    const user = await userRepo.findOne({ where: { email, deletedAt: IsNull() } })

    if (!user) {
      return undefined
    }

    if (user.status !== UserStatusEnum.ACTIVE) {
      return undefined
    }

    const repository = TypeOrmHelper.getRepository(LoginTypeOrmEntity)
    const login = await repository.findOne({ where: { userId: user.id } })

    if (!login) {
      return undefined
    }

    return this.toDomain(login, Email.create(user.email)) ?? undefined
  }

  async loadByUserId(userId: string): Promise<LoginModel | undefined> {
    const repository = TypeOrmHelper.getRepository(LoginTypeOrmEntity)
    const login = await repository.findOne({
      where: { userId, deletedAt: IsNull() },
      relations: ['user']
    })
    if (login && login.user) {
      return this.toDomain(login, Email.create(login.user.email)) ?? undefined
    }
    return undefined
  }

  async updateAccessToken(id: string, token: string): Promise<void> {
    const repository = TypeOrmHelper.getRepository(LoginTypeOrmEntity)
    await repository.update({ id }, { accessToken: token })
  }

  async updateRole(userId: string, roleId: string): Promise<void> {
    const repository = TypeOrmHelper.getRepository(LoginTypeOrmEntity)

    await repository.update({ userId }, { roleId })
  }

  async updatePassword(id: Id, passwordHash: string): Promise<void> {
    const repository = TypeOrmHelper.getRepository(LoginTypeOrmEntity)
    await repository.update({ id: id.value }, { password: passwordHash })
  }

  async updateStatus(id: Id, isActive: boolean): Promise<void> {
    const repository = TypeOrmHelper.getRepository(LoginTypeOrmEntity)
    await repository.update({ id: id.value }, { status: isActive ? 'ACTIVE' : 'INACTIVE' })
  }

  private toDomain(entity: LoginTypeOrmEntity, email: Email): Login | null {
    try {
      if (!entity.roleId) return null

      const roleIdOrError = Id.create(entity.roleId)
      const userIdOrError = Id.create(entity.userId)
      const idOrError = Id.create(entity.id)

      return Login.create({
        id: idOrError,
        userId: userIdOrError,
        roleId: roleIdOrError,
        email: email,
        passwordHash: entity.password,
        isActive: entity.status === 'ACTIVE'
      })
    } catch (_error) {
      return null
    }
  }
}
