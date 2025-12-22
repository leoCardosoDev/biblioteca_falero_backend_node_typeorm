import { AddLoginRepository } from '@/data/protocols/db/add-login-repository'
import { AddLoginParams } from '@/domain/usecases/add-login'
import { LoginModel } from '@/domain/models/login'
import { TypeOrmHelper } from '@/infra/db/typeorm/typeorm-helper'
import { LoginTypeOrmEntity } from '@/infra/db/typeorm/entities/login-entity'

export class LoginTypeOrmRepository implements AddLoginRepository {
  async add(loginData: AddLoginParams): Promise<LoginModel> {
    const loginRepo = await TypeOrmHelper.getRepository(LoginTypeOrmEntity)
    const login = loginRepo.create(loginData)
    await loginRepo.save(login)
    return login
  }
}
