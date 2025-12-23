import { AddUserRepository } from '@/application/protocols/add-user-repository'
import { LoadUserByEmailRepository } from '@/application/protocols/db/load-user-by-email-repository'
import { LoadUserByCpfRepository } from '@/application/protocols/db/load-user-by-cpf-repository'
import { AddUserParams } from '@/domain/usecases/add-user'
import { UserModel } from '@/domain/models/user'
import { TypeOrmHelper } from '@/infra/db/typeorm/typeorm-helper'
import { UserTypeOrmEntity } from '@/infra/db/typeorm/entities/user-entity'

export class UserTypeOrmRepository implements AddUserRepository, LoadUserByEmailRepository, LoadUserByCpfRepository {
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
      dataNascimento: new Date(user.dataNascimento)
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
      dataNascimento: new Date(user.dataNascimento)
    }
  }
}
