import 'reflect-metadata'
import { TypeOrmHelper } from '@/infra/db/typeorm/typeorm-helper'
import { AccountRepository } from '@/infra/db/typeorm/account-repository'
import { AccountTypeOrmEntity } from '@/infra/db/typeorm/entities/account-entity'

describe('Account Repository', () => {
  beforeAll(async () => {
    await TypeOrmHelper.connect({
      type: 'better-sqlite3',
      database: ':memory:',
      dropSchema: true,
      entities: [AccountTypeOrmEntity],
      synchronize: true
    })
  })

  afterAll(async () => {
    await TypeOrmHelper.disconnect()
  })

  beforeEach(async () => {
    const accountRepo = TypeOrmHelper.getRepository(AccountTypeOrmEntity)
    await accountRepo.clear()
  })

  test('Should return an account on success', async () => {
    const sut = new AccountRepository()
    const account = await sut.add({
      name: 'any_name',
      email: 'any_email@mail.com',
      password: 'any_password'
    })
    expect(account).toBeTruthy()
    expect(account.id).toBeTruthy()
    expect(account.name).toBe('any_name')
    expect(account.email).toBe('any_email@mail.com')
    expect(account.password).toBe('any_password')
  })
})
