import jwt from 'jsonwebtoken'
import { DataSource } from 'typeorm'

import app, { setupApp } from '@/main/config/app'
import { TypeOrmHelper } from '@/infra/db/typeorm/typeorm-helper'
import { LoginTypeOrmEntity } from '@/infra/db/typeorm/entities/login-entity'
import { UserTypeOrmEntity } from '@/infra/db/typeorm/entities/user-entity'


import { PermissionTypeOrmEntity } from '@/infra/db/typeorm/entities/permission-entity'
import { RoleTypeOrmEntity } from '@/infra/db/typeorm/entities/role-entity'

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

    // Seed Roles
    const roleRepo = dataSource.getRepository(RoleTypeOrmEntity)
    await roleRepo.save([
      roleRepo.create({
        slug: 'MEMBER',
        description: 'Member Role'
      }),
      roleRepo.create({
        slug: 'LIBRARIAN',
        description: 'Librarian Role'
      })
    ])

    // Seed Users
    const userRepo = dataSource.getRepository(UserTypeOrmEntity)
    await userRepo.save([
      userRepo.create({
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Target User',
        email: 'target@mail.com',
        rg: '123456789',
        cpf: '12345678900',
        gender: 'male',
        status: 'ACTIVE'
      }),
      userRepo.create({
        id: 'any_id',
        name: 'Auth User',
        email: 'auth@mail.com',
        rg: '987654321',
        cpf: '98765432100',
        gender: 'female',
        status: 'ACTIVE'
      })
    ])
  })

  afterAll(async () => {
    await TypeOrmHelper.disconnect()
    await app.close()
  })

  beforeEach(async () => {
    await dataSource.synchronize(true)

    // Seed Roles
    const roleRepo = dataSource.getRepository(RoleTypeOrmEntity)
    await roleRepo.save([
      roleRepo.create({
        slug: 'MEMBER',
        description: 'Member Role'
      }),
      roleRepo.create({
        slug: 'LIBRARIAN',
        description: 'Librarian Role'
      })
    ])

    // Seed Users
    const userRepo = dataSource.getRepository(UserTypeOrmEntity)
    await userRepo.save([
      userRepo.create({
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Target User',
        email: 'target@mail.com',
        rg: '123456789',
        cpf: '12345678900',
        gender: 'male',
        status: 'ACTIVE'
      }),
      userRepo.create({
        id: 'any_id',
        name: 'Auth User',
        email: 'auth@mail.com',
        rg: '987654321',
        cpf: '98765432100',
        gender: 'female',
        status: 'ACTIVE'
      })
    ])
  })

  describe('POST /users/:userId/login', () => {
    test('Should return 403 if no access token is provided', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/users/550e8400-e29b-41d4-a716-446655440001/login',
        payload: {
          password: 'Abcdefg1!',
          email: 'target@mail.com'
        }
      })
      expect(response.statusCode).toBe(403)
    })

    test('Should return 200 on success with valid token', async () => {
      const accessToken = makeAccessToken('LIBRARIAN')
      const response = await app.inject({
        method: 'POST',
        url: '/api/users/550e8400-e29b-41d4-a716-446655440001/login',
        headers: { authorization: `Bearer ${accessToken}` },
        payload: {
          password: 'Abcdefg1!',
          email: 'target@mail.com'
        }
      })
      expect(response.statusCode).toBe(200)
    })

    test('Should return 400 if password is missing', async () => {
      const accessToken = makeAccessToken('LIBRARIAN')
      const response = await app.inject({
        method: 'POST',
        url: '/api/users/550e8400-e29b-41d4-a716-446655440001/login',
        headers: { authorization: `Bearer ${accessToken}` },
        payload: {
          email: 'target@mail.com'
        }
      })
      expect(response.statusCode).toBe(400)
    })
  })
})
