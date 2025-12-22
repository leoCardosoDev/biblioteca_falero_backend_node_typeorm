import { DataSource } from 'typeorm'

import app from '@/main/config/app'
import { TypeOrmHelper } from '@/infra/db/typeorm/typeorm-helper'
import { LoginTypeOrmEntity } from '@/infra/db/typeorm/entities/login-entity'

describe('Login Routes', () => {
  let dataSource: DataSource

  beforeAll(async () => {
    dataSource = await TypeOrmHelper.connect({
      type: 'better-sqlite3',
      database: ':memory:',
      dropSchema: true,
      synchronize: true,
      entities: [LoginTypeOrmEntity]
    })
    await app.ready()
  })

  afterAll(async () => {
    await TypeOrmHelper.disconnect()
    await app.close()
  })

  beforeEach(async () => {
    await dataSource.synchronize(true)
  })

  describe('POST /logins', () => {
    test('Should return 200 on success', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/logins',
        payload: {
          email: 'leocardosodev@gmail.com',
          password: '123',
          userId: 'any_user_id'
        }
      })
      expect(response.statusCode).toBe(200)
    })

    test('Should return 400 if email is missing', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/logins',
        payload: {
          password: '123',
          userId: 'any_user_id'
        }
      })
      expect(response.statusCode).toBe(400)
    })
  })
})
