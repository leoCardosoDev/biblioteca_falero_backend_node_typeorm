import 'reflect-metadata'
import { TypeOrmHelper } from '@/infra/db/typeorm/typeorm-helper'
import { LogRepository } from '@/infra/db/typeorm/log-repository'
import { LogTypeOrmEntity } from '@/infra/db/typeorm/entities/log-entity'

describe('Log Repository', () => {
  beforeAll(async () => {
    await TypeOrmHelper.connect({
      type: 'better-sqlite3',
      database: ':memory:',
      dropSchema: true,
      entities: [LogTypeOrmEntity],
      synchronize: true
    })
  })

  afterAll(async () => {
    await TypeOrmHelper.disconnect()
  })

  beforeEach(async () => {
    const logRepo = TypeOrmHelper.getRepository(LogTypeOrmEntity)
    await logRepo.clear()
  })

  test('Should create an error log on success', async () => {
    const sut = new LogRepository()
    await sut.logError('any_error')
    const logRepo = TypeOrmHelper.getRepository(LogTypeOrmEntity)
    const count = await logRepo.count()
    expect(count).toBe(1)
  })
})
