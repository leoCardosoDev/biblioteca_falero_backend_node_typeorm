import jwt from 'jsonwebtoken'

import app, { setupApp } from '@/main/config/app'
import { TypeOrmHelper } from '@/infra/db/typeorm/typeorm-helper'
import { UserTypeOrmEntity } from '@/infra/db/typeorm/entities/user-entity'
import { LoginTypeOrmEntity } from '@/infra/db/typeorm/entities/login-entity'
import { RoleTypeOrmEntity } from '@/infra/db/typeorm/entities/role-entity'
import { PermissionTypeOrmEntity } from '@/infra/db/typeorm/entities/permission-entity'
import { DomainEventTypeOrmEntity } from '@/infra/db/typeorm/entities/domain-event-entity'
import { State } from '@/infra/db/typeorm/entities/state'
import { City } from '@/infra/db/typeorm/entities/city'
import { Neighborhood } from '@/infra/db/typeorm/entities/neighborhood'
import { DataSource } from 'typeorm'


const makeAccessToken = (role: string = 'LIBRARIAN'): string => {
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
      entities: [UserTypeOrmEntity, LoginTypeOrmEntity, RoleTypeOrmEntity, PermissionTypeOrmEntity, DomainEventTypeOrmEntity, State, City, Neighborhood]
    })
    await setupApp()
    await app.ready()
  })

  afterAll(async () => {
    await TypeOrmHelper.disconnect()
    await app.close()
  })

  // Helper to seed state for address tests
  const seedState = async () => {
    const stateRepo = dataSource.getRepository(State)
    const state = stateRepo.create({ name: 'São Paulo', uf: 'SP' })
    await stateRepo.save(state)
  }

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
      expect(response.json()).toEqual({
        error: {
          type: 'SECURITY',
          code: 'ACCESS_DENIED',
          message: 'Access denied'
        }
      })
    })

    test('Should return 403 if user role is STUDENT', async () => {
      const accessToken = makeAccessToken('STUDENT')
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
      expect(response.json()).toEqual({
        error: {
          type: 'SECURITY',
          code: 'ACCESS_DENIED',
          message: 'Access denied'
        }
      })
    })

    test('Should return 200 on success with valid token', async () => {
      const accessToken = makeAccessToken('LIBRARIAN')
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

    test('Should return 400 if name is too short', async () => {
      const accessToken = makeAccessToken('LIBRARIAN')
      const response = await app.inject({
        method: 'POST',
        url: '/api/users',
        headers: { authorization: `Bearer ${accessToken}` },
        payload: {
          name: 'A', // Invalid
          email: 'valid@mail.com',
          rg: '123456789',
          cpf: '529.982.247-25',
          gender: 'male'
        }
      })
      expect(response.statusCode).toBe(400)
      expect(response.statusCode).toBe(400)
      expect(response.json()).toMatchObject({
        error: {
          type: 'VALIDATION',
          code: 'INVALID_NAME'
        }
      })
    })

    test('Should return 400 if email is invalid', async () => {
      const accessToken = makeAccessToken('LIBRARIAN')
      const response = await app.inject({
        method: 'POST',
        url: '/api/users',
        headers: { authorization: `Bearer ${accessToken}` },
        payload: {
          name: 'Valid Name',
          email: 'invalid-email',
          rg: '123456789',
          cpf: '529.982.247-25',
          gender: 'male'
        }
      })
      expect(response.statusCode).toBe(400)
      expect(response.statusCode).toBe(400)
      expect(response.json()).toMatchObject({
        error: {
          type: 'VALIDATION',
          code: 'INVALID_PARAMETERS'
        }
      })
    })

    test('Should return 403 if email is already in use', async () => {
      const accessToken = makeAccessToken('LIBRARIAN')
      // Create first user
      await app.inject({
        method: 'POST',
        url: '/api/users',
        headers: { authorization: `Bearer ${accessToken}` },
        payload: {
          name: 'First User',
          email: 'duplicate@mail.com',
          rg: '123456789',
          cpf: '529.982.247-25',
          gender: 'male'
        }
      })
      // Try create second user with same email
      const response = await app.inject({
        method: 'POST',
        url: '/api/users',
        headers: { authorization: `Bearer ${accessToken}` },
        payload: {
          name: 'Second User',
          email: 'duplicate@mail.com',
          rg: '987654321',
          cpf: '71428793860',
          gender: 'male'
        }
      })
      expect(response.statusCode).toBe(409)
      expect(response.json()).toMatchObject({
        error: {
          type: 'REPOSITORY',
          code: 'EMAIL_IN_USE'
        }
      })
    })

    test('Should return 200 and create user with address (Geo feature)', async () => {
      await seedState()
      const accessToken = makeAccessToken('LIBRARIAN')
      const response = await app.inject({
        method: 'POST',
        url: '/api/users',
        headers: { authorization: `Bearer ${accessToken}` },
        payload: {
          name: 'User With Address',
          email: 'address@mail.com',
          rg: '111111111',
          cpf: '529.982.247-25',
          gender: 'female',
          address: {
            street: 'Rua Teste',
            number: '123',
            zipCode: '12345678',
            city: 'São Paulo',
            neighborhood: 'Centro',
            state: 'SP'
          }
        }
      })
      if (response.statusCode !== 200) {
        console.error('DEBUG FAIL:', JSON.stringify(response.json(), null, 2))
        throw new Error(`DEBUG FAIL: ${JSON.stringify(response.json(), null, 2)}`)
      }
      expect(response.statusCode).toBe(200)
      const body = response.json()
      // Response doesn't include address anymore, verify via DB
      const userRepo = dataSource.getRepository(UserTypeOrmEntity)
      const user = await userRepo.findOne({
        where: { id: body.id },
        relations: ['addressNeighborhood', 'addressCity', 'addressState']
      })
      expect(user).toBeTruthy()
      expect(user?.addressStreet).toBe('Rua Teste')
      expect(user?.addressNumber).toBe('123')
      expect(user?.addressZipCode).toBe('12345678')
      // Implicitly verifies that GeoService worked if no error was returned
    })
  })

  describe('GET /users', () => {
    test('Should return 403 if no access token is provided', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/users'
      })
      expect(response.statusCode).toBe(403)
      expect(response.json()).toEqual({
        error: {
          type: 'SECURITY',
          code: 'ACCESS_DENIED',
          message: 'Access denied'
        }
      })
    })

    test('Should return 403 if user role is STUDENT', async () => {
      const accessToken = makeAccessToken('STUDENT')
      const response = await app.inject({
        method: 'GET',
        url: '/api/users',
        headers: { authorization: `Bearer ${accessToken}` }
      })
      expect(response.statusCode).toBe(403)
      expect(response.json()).toEqual({
        error: {
          type: 'SECURITY',
          code: 'ACCESS_DENIED',
          message: 'Access denied'
        }
      })
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
      const accessToken = makeAccessToken('LIBRARIAN')
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

  describe('GET /users/:id', () => {
    test('Should return 200 and include stateId in address', async () => {
      const stateRepo = dataSource.getRepository(State)
      const cityRepo = dataSource.getRepository(City)
      const neighborhoodRepo = dataSource.getRepository(Neighborhood)
      const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)

      const state = await stateRepo.save(stateRepo.create({ name: 'São Paulo', uf: 'SP' }))
      const city = await cityRepo.save(cityRepo.create({ name: 'São Paulo', state_id: state.id }))
      const neighborhood = await neighborhoodRepo.save(neighborhoodRepo.create({ name: 'Centro', city_id: city.id }))

      const user = await userRepo.save(userRepo.create({
        name: 'User With State',
        email: 'state_check@mail.com',
        rg: '555555555',
        cpf: '55555555555',
        gender: 'male',
        addressStreet: 'Rua Teste',
        addressNumber: '123',
        addressComplement: 'Ap 1',
        addressNeighborhoodId: neighborhood.id,
        addressCityId: city.id,
        addressStateId: state.id,
        addressZipCode: '12345678'
      }))

      const accessToken = makeAccessToken('LIBRARIAN')
      const response = await app.inject({
        method: 'GET',
        url: `/api/users/${user.id}`,
        headers: { authorization: `Bearer ${accessToken}` }
      })

      expect(response.statusCode).toBe(200)
      const body = response.json()
      expect(body.address).toBeDefined()
      expect(body.address.stateId).toBe(state.id)
    })
  })

  describe('PUT /users/:id', () => {
    test('Should return 403 if user role is not ADMIN', async () => {
      const accessToken = makeAccessToken('LIBRARIAN')
      const response = await app.inject({
        method: 'PUT',
        url: '/api/users/550e8400-e29b-41d4-a716-446655440000',
        headers: { authorization: `Bearer ${accessToken}` },
        payload: { name: 'updated_name' }
      })
      expect(response.statusCode).toBe(403)
      expect(response.json()).toEqual({
        error: {
          type: 'SECURITY',
          code: 'ACCESS_DENIED',
          message: 'Access denied'
        }
      })
    })

    test('Should return 404 if user does not exist', async () => {
      const accessToken = makeAccessToken('ADMIN')
      const response = await app.inject({
        method: 'PUT',
        url: '/api/users/550e8400-e29b-41d4-a716-446655440000',
        headers: { authorization: `Bearer ${accessToken}` },
        payload: { name: 'non_existent_user' }
      })
      expect(response.statusCode).toBe(404)
      expect(response.json()).toEqual({
        error: {
          type: 'REPOSITORY',
          code: 'NOT_FOUND',
          message: 'User not found'
        }
      })
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
      const accessToken = makeAccessToken('ADMIN')
      const response = await app.inject({
        method: 'PUT',
        url: `/api/users/${user.id}`,
        headers: { authorization: `Bearer ${accessToken}` },
        payload: { name: 'updated_name_confirmed' }
      })
      expect(response.statusCode).toBe(200)
      expect(response.json().name).toBe('updated_name_confirmed')
    })

    test('Should return 200 and return address names on update', async () => {
      const stateRepo = dataSource.getRepository(State)
      const cityRepo = dataSource.getRepository(City)
      const neighborhoodRepo = dataSource.getRepository(Neighborhood)
      const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)

      const state = await stateRepo.save(stateRepo.create({ name: 'Ceará', uf: 'CE' }))
      const city = await cityRepo.save(cityRepo.create({ name: 'Quixadá', state_id: state.id }))
      const neighborhood = await neighborhoodRepo.save(neighborhoodRepo.create({ name: 'Centro', city_id: city.id }))

      const user = await userRepo.save(userRepo.create({
        name: 'User Address Test',
        email: 'addr_test@mail.com',
        rg: '111222333',
        cpf: '11122233344',
        gender: 'female'
      }))

      const accessToken = makeAccessToken('ADMIN')
      const response = await app.inject({
        method: 'PUT',
        url: `/api/users/${user.id}`,
        headers: { authorization: `Bearer ${accessToken}` },
        payload: {
          address: {
            street: 'Rua das Flores',
            number: '456',
            zipCode: '63900000',
            neighborhoodId: neighborhood.id,
            cityId: city.id,
            stateId: state.id
          }
        }
      })

      expect(response.statusCode).toBe(200)
      const body = response.json()
      expect(body.address.neighborhood).toBe('Centro')
      expect(body.address.city).toBe('Quixadá')
      expect(body.address.state).toBe('CE')
    })
  })

  describe('DELETE /users/:id', () => {
    test('Should return 403 if user role is not ADMIN', async () => {
      const accessToken = makeAccessToken('LIBRARIAN')
      const response = await app.inject({
        method: 'DELETE',
        url: '/api/users/550e8400-e29b-41d4-a716-446655440000',
        headers: { authorization: `Bearer ${accessToken}` }
      })
      expect(response.statusCode).toBe(403)
      expect(response.json()).toEqual({
        error: {
          type: 'SECURITY',
          code: 'ACCESS_DENIED',
          message: 'Access denied'
        }
      })
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
      const accessToken = makeAccessToken('ADMIN')
      const response = await app.inject({
        method: 'DELETE',
        url: `/api/users/${user.id}`,
        headers: { authorization: `Bearer ${accessToken}` }
      })
      expect(response.statusCode).toBe(204)
    })
  })
})
