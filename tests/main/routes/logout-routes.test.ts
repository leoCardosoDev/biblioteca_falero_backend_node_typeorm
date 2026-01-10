import { DataSource } from 'typeorm'
import crypto from 'crypto'

import app, { setupApp } from '@/main/config/app'
import { TypeOrmHelper } from '@/infra/db/typeorm/typeorm-helper'
import { SessionTypeOrmEntity } from '@/infra/db/typeorm/entities/session-entity'
import { UserTypeOrmEntity } from '@/infra/db/typeorm/entities/user-entity'
import { LoginTypeOrmEntity } from '@/infra/db/typeorm/entities/login-entity'
import { RoleTypeOrmEntity } from '@/infra/db/typeorm/entities/role-entity'
import { PermissionTypeOrmEntity } from '@/infra/db/typeorm/entities/permission-entity'
import { State } from '@/infra/db/typeorm/entities/state'
import { City } from '@/infra/db/typeorm/entities/city'
import { Neighborhood } from '@/infra/db/typeorm/entities/neighborhood'

describe('Logout Routes', () => {
  let dataSource: DataSource

  beforeAll(async () => {
    dataSource = await TypeOrmHelper.connect({
      type: 'better-sqlite3',
      database: ':memory:',
      dropSchema: true,
      synchronize: true,
      entities: [SessionTypeOrmEntity, UserTypeOrmEntity, LoginTypeOrmEntity, RoleTypeOrmEntity, PermissionTypeOrmEntity, State, City, Neighborhood]
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

  describe('POST /logout', () => {
    test('Should return 204 on success', async () => {
      const refreshToken = 'any_token'
      const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex')
      const sessionRepo = dataSource.getRepository(SessionTypeOrmEntity)
      await sessionRepo.save(sessionRepo.create({
        userId: '550e8400-e29b-41d4-a716-446655440003',
        refreshTokenHash,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
        isValid: true
      }))

      const response = await app.inject({
        method: 'POST',
        url: '/api/logout',
        payload: {
          refreshToken
        }
      })

      expect(response.statusCode).toBe(204)

      const session = await sessionRepo.findOne({ where: { refreshTokenHash } })
      expect(session?.isValid).toBe(false)
    })

    test('Should return 400 if refreshToken is missing', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/logout',
        payload: {}
      })

      expect(response.statusCode).toBe(400)
    })

    test('Should return 204 even if refreshToken is invalid/not found', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/logout',
        payload: {
          refreshToken: 'non_existent_token'
        }
      })

      expect(response.statusCode).toBe(204)
    })
  })
})
