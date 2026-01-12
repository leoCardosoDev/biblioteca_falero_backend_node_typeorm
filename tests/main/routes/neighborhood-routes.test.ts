
import app, { setupApp } from '@/main/config/app'
import { TypeOrmHelper } from '@/infra/db/typeorm/typeorm-helper'
import { Neighborhood } from '@/infra/db/typeorm/entities/neighborhood'
import { City } from '@/infra/db/typeorm/entities/city'
import { State } from '@/infra/db/typeorm/entities/state'
import { sign } from 'jsonwebtoken'
import env from '@/main/config/env'
import { UserRole } from '@/domain/value-objects/user-role'

describe('Neighborhood Routes', () => {
  beforeAll(async () => {
    await TypeOrmHelper.connect({
      type: 'better-sqlite3',
      database: ':memory:',
      dropSchema: true,
      synchronize: true,
      entities: [Neighborhood, City, State]
    })
    await setupApp()
    await app.ready()
  })

  afterAll(async () => {
    await TypeOrmHelper.disconnect()
  })

  beforeEach(async () => {
    await TypeOrmHelper.client.synchronize(true)
  })

  const makeAccessToken = (role = 'ADMIN'): string => {
    return sign({ id: 'any_id', role: UserRole.restore(role).value }, env.jwtSecret)
  }

  describe('GET /neighborhoods/:id', () => {
    test('Should return 200 on success', async () => {
      const stateRepo = await TypeOrmHelper.getRepository(State)
      const cityRepo = await TypeOrmHelper.getRepository(City)
      const neighborhoodRepo = await TypeOrmHelper.getRepository(Neighborhood)

      const state = stateRepo.create({
        name: 'State Name',
        uf: 'ST'
      })
      await stateRepo.save(state)

      const city = cityRepo.create({
        name: 'City Name',
        state_id: state.id
      })
      await cityRepo.save(city)

      const neighborhood = neighborhoodRepo.create({
        name: 'Neighborhood Name',
        city_id: city.id
      })
      await neighborhoodRepo.save(neighborhood)

      const response = await app.inject({
        method: 'GET',
        url: `/api/neighborhoods/${neighborhood.id}`,
        headers: { authorization: `Bearer ${makeAccessToken()}` }
      })

      expect(response.statusCode).toBe(200)
      expect(response.json()).toEqual({
        id: neighborhood.id,
        name: 'Neighborhood Name',
        cityId: city.id
      })
    })

    test('Should return 404 if neighborhood not found', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/neighborhoods/12345678-1234-1234-1234-123456789012',
        headers: { authorization: `Bearer ${makeAccessToken()}` }
      })
      expect(response.statusCode).toBe(404)
    })

    test('Should return 403 if no token is provided', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/neighborhoods/12345678-1234-1234-1234-123456789012'
      })
      expect(response.statusCode).toBe(403)
    })
  })
})
