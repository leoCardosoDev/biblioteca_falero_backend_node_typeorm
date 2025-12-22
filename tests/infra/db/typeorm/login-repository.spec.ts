import { TypeOrmHelper } from '@/infra/db/typeorm/typeorm-helper'
import { LoginTypeOrmRepository } from '@/infra/db/typeorm/login-repository'
import { LoginTypeOrmEntity } from '@/infra/db/typeorm/entities/login-entity'
import { DataSource } from 'typeorm'
import { CreateUserLoginParams } from '@/domain/usecases/create-user-login'

describe('LoginTypeOrmRepository', () => {
  let dataSource: DataSource

  beforeAll(async () => {
    dataSource = await TypeOrmHelper.connect({
      type: 'better-sqlite3',
      database: ':memory:',
      dropSchema: true,
      synchronize: true,
      entities: [LoginTypeOrmEntity]
    })
  })

  afterAll(async () => {
    await TypeOrmHelper.disconnect()
  })

  beforeEach(async () => {
    await dataSource.synchronize(true)
  })

  const makeSut = (): LoginTypeOrmRepository => {
    return new LoginTypeOrmRepository()
  }

  test('Should return an account on success', async () => {
    const sut = makeSut()
    const createLoginParams: CreateUserLoginParams = {
      password: 'any_password',
      userId: 'any_user_id',
      role: 'any_role'
    }
    const login = await sut.create(createLoginParams)
    expect(login).toBeTruthy()
    expect(login.id).toBeTruthy()
    expect(login.password).toBe('any_password')
    expect(login.userId).toBe('any_user_id')
    expect(login.role).toBe('any_role')
  })
})
