import { CreateUserLoginRepository } from '@/application/protocols/db/create-user-login-repository'
import { CreateUserLoginParams } from '@/domain/usecases/create-user-login'
import { LoginModel } from '@/domain/models/login'
import { LoginTypeOrmEntity } from './entities/login-entity'
import { TypeOrmHelper } from './typeorm-helper'

export class LoginTypeOrmRepository implements CreateUserLoginRepository {
  async create(data: CreateUserLoginParams): Promise<LoginModel> {
    const repository = TypeOrmHelper.getRepository(LoginTypeOrmEntity)
    const login = repository.create(data)
    await repository.save(login)
    return login
  }
}
