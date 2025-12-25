import { CreateUserLoginRepository } from '@/application/protocols/db/create-user-login-repository'
import { LoadAccountByEmailRepository } from '@/application/protocols/db/load-account-by-email-repository'
import { UpdateAccessTokenRepository } from '@/application/protocols/db/update-access-token-repository'
import { CreateUserLoginParams } from '@/domain/usecases/create-user-login'
import { LoginModel } from '@/domain/models/login'
import { LoginId } from '@/domain/models/ids'
import { LoginTypeOrmEntity } from './entities/login-entity'
import { UserTypeOrmEntity } from './entities/user-entity'
import { TypeOrmHelper } from './typeorm-helper'

export class LoginTypeOrmRepository implements CreateUserLoginRepository, LoadAccountByEmailRepository, UpdateAccessTokenRepository {
  async create(data: CreateUserLoginParams): Promise<LoginModel> {
    const repository = TypeOrmHelper.getRepository(LoginTypeOrmEntity)
    const login = repository.create(data)
    await repository.save(login)
    return login as unknown as LoginModel
  }

  async loadByEmail(email: string): Promise<LoginModel | undefined> {
    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    const user = await userRepo.findOne({ where: { email } })
    if (user) {
      const repository = TypeOrmHelper.getRepository(LoginTypeOrmEntity)
      const login = await repository.findOne({ where: { userId: user.id } })
      if (login) {
        return { ...login, name: user.name } as unknown as LoginModel
      }
    }
    return undefined
  }

  async updateAccessToken(id: LoginId, token: string): Promise<void> {
    const repository = TypeOrmHelper.getRepository(LoginTypeOrmEntity)
    await repository.update({ id }, { accessToken: token })
  }
}
