import jwt from 'jsonwebtoken'
import { DataSource } from 'typeorm'

import app, { setupApp } from '@/main/config/app'
import { TypeOrmHelper } from '@/infra/db/typeorm/typeorm-helper'
import { LoginTypeOrmEntity } from '@/infra/db/typeorm/entities/login-entity'
import { UserTypeOrmEntity } from '@/infra/db/typeorm/entities/user-entity'
import { RoleTypeOrmEntity } from '@/infra/db/typeorm/entities/role-entity'
import { PermissionTypeOrmEntity } from '@/infra/db/typeorm/entities/permission-entity'
const makeAccessToken = (role: string = 'LIBRARIAN'): string => {
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
      entities: [LoginTypeOrmEntity, UserTypeOrmEntity, RoleTypeOrmEntity, PermissionTypeOrmEntity]
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
    const roleRepo = TypeOrmHelper.getRepository(RoleTypeOrmEntity)
    await roleRepo.save([
      { id: '550e8400-e29b-41d4-a716-446655440001', slug: 'ADMIN', description: 'Admin' },
      { id: '550e8400-e29b-41d4-a716-446655440002', slug: 'LIBRARIAN', description: 'Librarian' },
      { id: '550e8400-e29b-41d4-a716-446655440003', slug: 'MEMBER', description: 'Member' }
    ])
  })

  describe('POST /users/:userId/login', () => {
    test('Should return 403 if no access token is provided', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/users/550e8400-e29b-41d4-a716-446655440000/login',
        payload: {
          email: 'any_email@mail.com',
          password: 'Abcdefg1!',
          role: 'member',
          status: 'active'
        }
      })
      expect(response.statusCode).toBe(403)
    })

    test('Should return 200 on success with valid token', async () => {
      const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
      const user = await userRepo.save(userRepo.create({
        name: 'John Doe',
        email: 'john@mail.com',
        rg: '123456789',
        cpf: '52998224725',
        gender: 'male'
      }))

      const accessToken = makeAccessToken('ADMIN')
      const response = await app.inject({
        method: 'POST',
        url: `/api/users/${user.id}/login`,
        headers: { authorization: `Bearer ${accessToken}` },
        payload: {
          email: 'john@mail.com',
          password: 'Abcdefg1!',
          role: 'librarian',
          status: 'active'
        }
      })
      expect(response.statusCode).toBe(200)
    })

    test('Should return 400 if password is missing', async () => {
      const accessToken = makeAccessToken('ADMIN')
      const response = await app.inject({
        method: 'POST',
        url: '/api/users/any_user_id/login',
        headers: { authorization: `Bearer ${accessToken}` },
        payload: {
          role: 'member',
          status: 'active'
        }
      })
      expect(response.statusCode).toBe(400)
    })
  })
})
