import 'reflect-metadata'
import { TypeOrmHelper } from '@/infra/db/typeorm/typeorm-helper'
import { UserTypeOrmRepository } from '@/infra/db/typeorm/user-repository'
import { UserTypeOrmEntity } from '@/infra/db/typeorm/entities/user-entity'

describe('UserTypeOrmRepository', () => {
  beforeAll(async () => {
    await TypeOrmHelper.connect({
      type: 'better-sqlite3',
      database: ':memory:',
      dropSchema: true,
      entities: [UserTypeOrmEntity],
      synchronize: true
    })
  })

  afterAll(async () => {
    await TypeOrmHelper.disconnect()
  })

  beforeEach(async () => {
    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    await userRepo.clear()
  })

  const makeSut = (): UserTypeOrmRepository => {
    return new UserTypeOrmRepository()
  }

  test('Should return a user on success', async () => {
    const sut = makeSut()
    const user = await sut.add({
      name: 'any_name',
      email: 'any_email@mail.com',
      rg: 'any_rg',
      cpf: 'any_cpf'
    })
    expect(user).toBeTruthy()
    expect(user.id).toBeTruthy()
    expect(user.name).toBe('any_name')
    expect(user.email).toBe('any_email@mail.com')
    expect(user.rg).toBe('any_rg')
    expect(user.cpf).toBe('any_cpf')
  })
})
