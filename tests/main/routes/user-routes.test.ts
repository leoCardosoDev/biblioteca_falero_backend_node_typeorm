import jwt from 'jsonwebtoken'

import app from '@/main/config/app'
import { TypeOrmHelper } from '@/infra/db/typeorm/typeorm-helper'
import { UserTypeOrmEntity } from '@/infra/db/typeorm/entities/user-entity'
import { DataSource } from 'typeorm'
import { Role } from '@/domain/models'

const makeAccessToken = (role: Role = Role.LIBRARIAN): string => {
  return jwt.sign({ id: 'any_id', role }, process.env.JWT_SECRET ?? 'secret')
}

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
    await dataSource.synchronize(true)
  })

  describe('POST /users', () => {
    test('Should return 403 if no access token is provided', async () => {
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
      expect(response.statusCode).toBe(403)
    })

    test('Should return 403 if user role is MEMBER', async () => {
      const accessToken = makeAccessToken(Role.MEMBER)
      const response = await app.inject({
        method: 'POST',
        url: '/api/users',
        headers: { authorization: `Bearer ${accessToken}` },
        payload: {
          name: 'Leo Cardoso',
          email: 'leocardosodev@gmail.com',
          rg: '123456789',
          cpf: '12345678900',
          dataNascimento: '1990-01-15'
        }
      })
      expect(response.statusCode).toBe(403)
    })

    test('Should return 200 on success with valid token', async () => {
      const accessToken = makeAccessToken(Role.LIBRARIAN)
      const response = await app.inject({
        method: 'POST',
        url: '/api/users',
        headers: { authorization: `Bearer ${accessToken}` },
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
