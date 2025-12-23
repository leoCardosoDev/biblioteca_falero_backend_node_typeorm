import { CreateUserLoginRepository } from '@/application/protocols/db/create-user-login-repository'
import { LoadAccountByEmailRepository } from '@/application/protocols/db/load-account-by-email-repository'
import { UpdateAccessTokenRepository } from '@/application/protocols/db/update-access-token-repository'
import { CreateUserLoginParams } from '@/domain/usecases/create-user-login'
import { LoginModel } from '@/domain/models/login'
import { LoginTypeOrmEntity } from './entities/login-entity'
import { TypeOrmHelper } from './typeorm-helper'

export class LoginTypeOrmRepository implements CreateUserLoginRepository, LoadAccountByEmailRepository, UpdateAccessTokenRepository {
  async create(data: CreateUserLoginParams): Promise<LoginModel> {
    const repository = TypeOrmHelper.getRepository(LoginTypeOrmEntity)
    const login = repository.create(data)
    await repository.save(login)
    return login
  }

  async loadByEmail(email: string): Promise<LoginModel | undefined> {
    const repository = TypeOrmHelper.getRepository(LoginTypeOrmEntity)
    const login = await repository.findOne({ where: { userId: email } })
    return login ?? undefined
  }

  async updateAccessToken(id: string, token: string): Promise<void> {
    const repository = TypeOrmHelper.getRepository(LoginTypeOrmEntity)
    await repository.update({ id }, { accessToken: token })
  }
}
