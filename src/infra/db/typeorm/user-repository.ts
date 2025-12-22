import { AddUserRepository } from '@/application/protocols/add-user-repository'
import { AddUserParams } from '@/domain/usecases/add-user'
import { UserModel } from '@/domain/models/user'
import { TypeOrmHelper } from '@/infra/db/typeorm/typeorm-helper'
import { UserTypeOrmEntity } from '@/infra/db/typeorm/entities/user-entity'

export class UserTypeOrmRepository implements AddUserRepository {
  async add(data: AddUserParams): Promise<UserModel> {
    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    const user = userRepo.create(data)
    await userRepo.save(user)
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      rg: user.rg,
      cpf: user.cpf
    }
  }
}
