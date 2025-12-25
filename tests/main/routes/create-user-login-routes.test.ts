import jwt from 'jsonwebtoken'
import { DataSource } from 'typeorm'

import app, { setupApp } from '@/main/config/app'
import { TypeOrmHelper } from '@/infra/db/typeorm/typeorm-helper'
import { LoginTypeOrmEntity } from '@/infra/db/typeorm/entities/login-entity'
import { UserTypeOrmEntity } from '@/infra/db/typeorm/entities/user-entity'
import { Role } from '@/domain/models'

const makeAccessToken = (role: Role = Role.LIBRARIAN): string => {
  return jwt.sign({ id: 'any_id', role }, process.env.JWT_SECRET ?? 'secret')
}

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
    await setupApp()
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
    test('Should return 403 if no access token is provided', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/users/any_user_id/login',
        payload: {
          password: 'Abcdefg1!'
        }
      })
      expect(response.statusCode).toBe(403)
    })

    test('Should return 200 on success with valid token', async () => {
      const accessToken = makeAccessToken(Role.LIBRARIAN)
      const response = await app.inject({
        method: 'POST',
        url: '/api/users/any_user_id/login',
        headers: { authorization: `Bearer ${accessToken}` },
        payload: {
          password: 'Abcdefg1!'
        }
      })
      expect(response.statusCode).toBe(200)
    })

    test('Should return 400 if password is missing', async () => {
      const accessToken = makeAccessToken(Role.LIBRARIAN)
      const response = await app.inject({
        method: 'POST',
        url: '/api/users/any_user_id/login',
        headers: { authorization: `Bearer ${accessToken}` },
        payload: {}
      })
      expect(response.statusCode).toBe(400)
    })
  })
})
