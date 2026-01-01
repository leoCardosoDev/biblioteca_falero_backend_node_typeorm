import jwt from 'jsonwebtoken'

import app, { setupApp } from '@/main/config/app'
import { TypeOrmHelper } from '@/infra/db/typeorm/typeorm-helper'
import { UserTypeOrmEntity } from '@/infra/db/typeorm/entities/user-entity'
import { LoginTypeOrmEntity } from '@/infra/db/typeorm/entities/login-entity'
import { DomainEventTypeOrmEntity } from '@/infra/db/typeorm/entities/domain-event-entity'
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
      entities: [UserTypeOrmEntity, LoginTypeOrmEntity, DomainEventTypeOrmEntity]
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

  describe('POST /users', () => {
    test('Should return 403 if no access token is provided', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/users',
        payload: {
          name: 'Leo Cardoso',
          email: 'leocardosodev@gmail.com',
          rg: '123456789',
          cpf: '529.982.247-25',
          gender: 'male'
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
          cpf: '529.982.247-25',
          gender: 'male'
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
          cpf: '529.982.247-25',
          gender: 'male'
        }
      })
      expect(response.statusCode).toBe(200)
    })
  })

  describe('GET /users', () => {
    test('Should return 403 if no access token is provided', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/users'
      })
      expect(response.statusCode).toBe(403)
    })

    test('Should return 403 if user role is MEMBER', async () => {
      const accessToken = makeAccessToken(Role.MEMBER)
      const response = await app.inject({
        method: 'GET',
        url: '/api/users',
        headers: { authorization: `Bearer ${accessToken}` }
      })
      expect(response.statusCode).toBe(403)
    })

    test('Should return 200 on success with valid token', async () => {
      const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
      await userRepo.save(userRepo.create({
        name: 'User 1',
        email: 'user1@mail.com',
        rg: '123456789',
        cpf: '52998224725',
        gender: 'male'
      }))
      const accessToken = makeAccessToken(Role.LIBRARIAN)
      const response = await app.inject({
        method: 'GET',
        url: '/api/users',
        headers: { authorization: `Bearer ${accessToken}` }
      })
      expect(response.statusCode).toBe(200)
      expect(response.json().length).toBe(1)
      expect(response.json()[0].name).toBe('User 1')
    })
  })

  describe('PUT /users/:id', () => {
    test('Should return 403 if user role is not ADMIN', async () => {
      const accessToken = makeAccessToken(Role.LIBRARIAN)
      const response = await app.inject({
        method: 'PUT',
        url: '/api/users/550e8400-e29b-41d4-a716-446655440000',
        headers: { authorization: `Bearer ${accessToken}` },
        payload: { name: 'updated_name' }
      })
      expect(response.statusCode).toBe(403)
    })

    test('Should return 404 if user does not exist', async () => {
      const accessToken = makeAccessToken(Role.ADMIN)
      const response = await app.inject({
        method: 'PUT',
        url: '/api/users/550e8400-e29b-41d4-a716-446655440000',
        headers: { authorization: `Bearer ${accessToken}` },
        payload: { name: 'non_existent_user' }
      })
      expect(response.statusCode).toBe(404)
    })

    test('Should return 200 on success', async () => {
      const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
      const user = await userRepo.save(userRepo.create({
        name: 'User To Update',
        email: 'update@mail.com',
        rg: '234567890',
        cpf: '52998224725',
        gender: 'male'
      }))
      const accessToken = makeAccessToken(Role.ADMIN)
      const response = await app.inject({
        method: 'PUT',
        url: `/api/users/${user.id}`,
        headers: { authorization: `Bearer ${accessToken}` },
        payload: { name: 'updated_name_confirmed' }
      })
      expect(response.statusCode).toBe(200)
      expect(response.json().name).toBe('updated_name_confirmed')
    })
  })

  describe('DELETE /users/:id', () => {
    test('Should return 403 if user role is not ADMIN', async () => {
      const accessToken = makeAccessToken(Role.LIBRARIAN)
      const response = await app.inject({
        method: 'DELETE',
        url: '/api/users/550e8400-e29b-41d4-a716-446655440000',
        headers: { authorization: `Bearer ${accessToken}` }
      })
      expect(response.statusCode).toBe(403)
    })

    test('Should return 204 on success', async () => {
      const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
      const user = await userRepo.save(userRepo.create({
        name: 'User To Delete',
        email: 'delete@mail.com',
        rg: '345678901',
        cpf: '71428793860',
        gender: 'male'
      }))
      const accessToken = makeAccessToken(Role.ADMIN)
      const response = await app.inject({
        method: 'DELETE',
        url: `/api/users/${user.id}`,
        headers: { authorization: `Bearer ${accessToken}` }
      })
      expect(response.statusCode).toBe(204)
    })
  })
})
