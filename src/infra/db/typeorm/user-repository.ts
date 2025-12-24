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

export class UserTypeOrmRepository implements AddUserRepository, LoadUserByEmailRepository, LoadUserByCpfRepository, LoadUsersRepository, UpdateUserRepository, DeleteUserRepository {
  async add(data: AddUserParams): Promise<UserModel> {
    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    const user = userRepo.create(data)
    await userRepo.save(user)
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      rg: user.rg,
      cpf: user.cpf,
      dataNascimento: user.dataNascimento
    }
  }

  async loadByEmail(email: string): Promise<UserModel | undefined> {
    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    const user = await userRepo.findOne({ where: { email } })
    if (!user) return undefined
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      rg: user.rg,
      cpf: user.cpf,
      dataNascimento: user.dataNascimento
    }
  }

  async loadByCpf(cpf: string): Promise<UserModel | undefined> {
    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    const user = await userRepo.findOne({ where: { cpf } })
    if (!user) return undefined
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      rg: user.rg,
      cpf: user.cpf,
      dataNascimento: user.dataNascimento
    }

  }

  async loadAll(): Promise<UserModel[]> {
    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    const users = await userRepo.find()
    return users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      rg: user.rg,
      cpf: user.cpf,
      dataNascimento: user.dataNascimento
    }))
  }

  async update(userData: UpdateUserParams): Promise<UserModel> {
    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    const user = await userRepo.findOne({ where: { id: userData.id } })
    if (!user) {
      throw new Error('User not found')
    }
    if (userData.name) user.name = userData.name
    if (userData.email) user.email = userData.email
    if (userData.rg) user.rg = userData.rg
    if (userData.cpf) user.cpf = userData.cpf
    if (userData.dataNascimento) user.dataNascimento = userData.dataNascimento

    await userRepo.save(user)
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      rg: user.rg,
      cpf: user.cpf,
      dataNascimento: user.dataNascimento
    }
  }

  async delete(id: string): Promise<void> {
    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    await userRepo.delete(id)
  }
}
