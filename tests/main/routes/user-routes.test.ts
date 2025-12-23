import app from '@/main/config/app'
import { TypeOrmHelper } from '@/infra/db/typeorm/typeorm-helper'
import { UserTypeOrmEntity } from '@/infra/db/typeorm/entities/user-entity'
import { DataSource } from 'typeorm'

describe('User Routes', () => {
  let dataSource: DataSource

  beforeAll(async () => {
    dataSource = await TypeOrmHelper.connect({
      type: 'better-sqlite3',
      database: ':memory:',
      dropSchema: true,
      synchronize: true,
      entities: [UserTypeOrmEntity]
    })
    await app.ready()
  })

  afterAll(async () => {
    await TypeOrmHelper.disconnect()
    await app.close()
  })

  beforeEach(async () => {
    await dataSource.synchronize(true) // Clear DB
  })

  describe('POST /users', () => {
    test('Should return 200 on success', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/users',
        payload: {
          name: 'Leo Cardoso',
          email: 'leocardosodev@gmail.com',
          rg: '123456789',
          cpf: '12345678900',
          dataNascimento: '1990-01-15'
        }
      })
      expect(response.statusCode).toBe(200)
    })
  })
})
