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

export class UserTypeOrmRepository implements AddUserRepository, LoadUserByEmailRepository, LoadUserByCpfRepository, LoadUsersRepository, UpdateUserRepository, DeleteUserRepository {
  private toUserModel(entity: UserTypeOrmEntity): UserModel {
    return {
      id: Id.create(entity.id),
      name: entity.name,
      email: Email.create(entity.email),
      rg: entity.rg,
      cpf: Cpf.create(entity.cpf),
      dataNascimento: entity.dataNascimento
    }
  }

  async add(data: AddUserParams): Promise<UserModel> {
    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    const user = userRepo.create({
      name: data.name,
      email: data.email.value,
      rg: data.rg,
      cpf: data.cpf.value,
      dataNascimento: data.dataNascimento
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
    if (userData.name) user.name = userData.name
    if (userData.email) user.email = userData.email.value
    if (userData.rg) user.rg = userData.rg
    if (userData.cpf) user.cpf = userData.cpf.value
    if (userData.dataNascimento) user.dataNascimento = userData.dataNascimento

    await userRepo.save(user)
    return this.toUserModel(user)
  }

  async delete(id: string): Promise<void> {
    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    await userRepo.delete(id)
  }
}
