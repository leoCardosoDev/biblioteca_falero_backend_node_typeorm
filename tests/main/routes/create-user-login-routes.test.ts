import jwt from 'jsonwebtoken'
import { DataSource } from 'typeorm'

import app, { setupApp } from '@/main/config/app'
import { TypeOrmHelper } from '@/shared/infra/db/typeorm/typeorm-helper'
import { LoginTypeOrmEntity } from '@/modules/identity/infra/db/typeorm/entities/login-entity'
import { UserTypeOrmEntity } from '@/modules/identity/infra/db/typeorm/entities/user-entity'


import { PermissionTypeOrmEntity } from '@/modules/identity/infra/db/typeorm/entities/permission-entity'
import { RoleTypeOrmEntity } from '@/modules/identity/infra/db/typeorm/entities/role-entity'
import { StateTypeOrmEntity as State } from '@/modules/geography/infra/db/typeorm/entities/state'
import { CityTypeOrmEntity as City } from '@/modules/geography/infra/db/typeorm/entities/city'
import { NeighborhoodTypeOrmEntity as Neighborhood } from '@/modules/geography/infra/db/typeorm/entities/neighborhood'

const makeAccessToken = (role: string = 'LIBRARIAN'): string => {
  return jwt.sign({ id: '550e8400-e29b-41d4-a716-446655440000', role }, process.env.JWT_SECRET ?? 'secret')
}

describe('CreateUserLogin Routes', () => {
  let dataSource: DataSource

  beforeAll(async () => {
    dataSource = await TypeOrmHelper.connect({
      type: 'better-sqlite3',
      database: ':memory:',
      dropSchema: true,
      synchronize: true,
      entities: [LoginTypeOrmEntity, UserTypeOrmEntity, RoleTypeOrmEntity, PermissionTypeOrmEntity, State, City, Neighborhood]
    })
    await setupApp()
    await app.ready()

    // Seed Roles
    const roleRepo = dataSource.getRepository(RoleTypeOrmEntity)
    await roleRepo.save([
      roleRepo.create({
        slug: 'STUDENT',
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
        cpf: '12345678909',
        gender: 'male',
        status: 'ACTIVE'
      }),
      userRepo.create({
        id: 'any_id',
        name: 'Auth User',
        email: 'auth@mail.com',
        rg: '987654321',
        cpf: '52998224725',
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
    const [_studentRole, librarianRole] = await roleRepo.save([
      roleRepo.create({
        slug: 'STUDENT',
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
        cpf: '12345678909',
        gender: 'male',
        status: 'ACTIVE'
      }),
      userRepo.create({
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Auth User',
        email: 'auth@mail.com',
        rg: '987654321',
        cpf: '52998224725',
        gender: 'female',
        status: 'ACTIVE'
      })
    ])

    // Seed Login for Auth User
    const loginRepo = dataSource.getRepository(LoginTypeOrmEntity)
    await loginRepo.save(loginRepo.create({
      id: '550e8400-e29b-41d4-a716-666655440000',
      userId: '550e8400-e29b-41d4-a716-446655440000',
      password: 'hashed_password',
      roleId: librarianRole.id,
      status: 'ACTIVE'
    }))
  })

  describe('POST /users/:userId/login', () => {
    test('Should return 403 if no access token is provided', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/users/550e8400-e29b-41d4-a716-446655440001/login',
        payload: {
          password: 'Abcdefg1!'
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
        }
      })
      expect(response.statusCode).toBe(400)
      expect(response.json()).toEqual({
        error: {
          type: 'VALIDATION',
          code: 'INVALID_PARAMETERS',
          message: 'One or more fields are invalid.',
          details: [{
            field: 'password',
            issue: 'required',
            message: "must have required property 'password'"
          }]
        }
      })
    })
  })
})
