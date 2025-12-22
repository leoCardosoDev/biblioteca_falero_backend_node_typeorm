import { DataSource } from 'typeorm'

import app from '@/main/config/app'
import { TypeOrmHelper } from '@/infra/db/typeorm/typeorm-helper'
import { LoginTypeOrmEntity } from '@/infra/db/typeorm/entities/login-entity'
import { UserTypeOrmEntity } from '@/infra/db/typeorm/entities/user-entity'

describe('CreateUserLogin Routes', () => {
  let dataSource: DataSource

  beforeAll(async () => {
    dataSource = await TypeOrmHelper.connect({
      type: 'better-sqlite3',
      database: ':memory:',
      dropSchema: true,
      synchronize: true,
      entities: [LoginTypeOrmEntity, UserTypeOrmEntity]
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

  describe('POST /users/:userId/login', () => {
    test('Should return 200 on success', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/users/any_user_id/login',
        payload: {
          password: '123'
        }
      })
      expect(response.statusCode).toBe(200)
    })

    test('Should return 400 if password is missing', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/users/any_user_id/login',
        payload: {
        }
      })
      expect(response.statusCode).toBe(400)
    })
  })
})
