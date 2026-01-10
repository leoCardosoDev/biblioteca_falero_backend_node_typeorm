import { setupApp } from '@/main/config/app'
import { TypeOrmHelper } from '@/infra/db/typeorm/typeorm-helper'
import { State } from '@/infra/db/typeorm/entities/state'
import { City } from '@/infra/db/typeorm/entities/city'
import { Neighborhood } from '@/infra/db/typeorm/entities/neighborhood'
import { Id } from '@/domain/value-objects/id'
import { FastifyInstance } from 'fastify'
import Redis from 'ioredis'
import crypto from 'crypto'
import env from '@/main/config/env'
import jwt from 'jsonwebtoken'

const makeAccessToken = (role: string = 'STUDENT'): string => {
  return jwt.sign({ id: 'any_id', role }, process.env.JWT_SECRET ?? 'secret')
}

describe('City/State Routes Integration', () => {
  let app: FastifyInstance
  let redisClient: Redis

  beforeAll(async () => {
    app = await setupApp()
    await app.ready()

    await TypeOrmHelper.connect({
      type: 'better-sqlite3',
      database: ':memory:',
      dropSchema: true,
      entities: [State, City, Neighborhood],
      synchronize: true
    })

    redisClient = new Redis(env.redisUrl)
  })

  afterAll(async () => {
    await TypeOrmHelper.disconnect()
    await app.close()
    redisClient.disconnect()
  })

  beforeEach(async () => {
    await TypeOrmHelper.getRepository(City).clear()
    await TypeOrmHelper.getRepository(State).clear()
    await redisClient.flushall()
  })

  test('GET /cities/:id should return 200 and cache the city', async () => {
    const stateRepo = await TypeOrmHelper.getRepository(State)
    const cityRepo = await TypeOrmHelper.getRepository(City)

    const stateId = Id.create(crypto.randomUUID())
    const state = stateRepo.create({
      id: stateId.value,
      name: 'São Paulo',
      uf: 'SP'
    })
    await stateRepo.save(state)

    const cityId = Id.create(crypto.randomUUID())
    const city = cityRepo.create({
      id: cityId.value,
      name: 'Campinas',
      state_id: stateId.value,
      createdAt: new Date()
    })
    await cityRepo.save(city)

    const response = await app.inject({
      method: 'GET',
      url: `/api/cities/${cityId.value}`,
      headers: { authorization: `Bearer ${makeAccessToken()}` }
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual(expect.objectContaining({
      id: cityId.value,
      name: 'Campinas'
    }))

    // Verify Redis Cache
    const cachedCity = await redisClient.get(`city:${cityId.value}`)
    expect(cachedCity).toBeTruthy()
    const parsedCity = JSON.parse(cachedCity!)
    expect(parsedCity.id.id).toBe(cityId.value)
  })

  test('GET /states/:id should return 200 and cache the state', async () => {
    const stateRepo = await TypeOrmHelper.getRepository(State)
    const stateId = Id.create(crypto.randomUUID())
    const state = stateRepo.create({
      id: stateId.value,
      name: 'Rio de Janeiro',
      uf: 'RJ'
    })
    await stateRepo.save(state)

    const response = await app.inject({
      method: 'GET',
      url: `/api/states/${stateId.value}`,
      headers: { authorization: `Bearer ${makeAccessToken()}` }
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual(expect.objectContaining({
      id: stateId.value,
      name: 'Rio de Janeiro',
      uf: 'RJ'
    }))

    // Verify Redis Cache
    const cachedState = await redisClient.get(`state:${stateId.value}`)
    expect(cachedState).toBeTruthy()
    const parsedState = JSON.parse(cachedState!)
    expect(parsedState.id.id).toBe(stateId.value)
  })

  test('Should return 403 if no access token is provided', async () => {
    const response = await app.inject({
      method: 'GET',
      url: `/api/cities/${crypto.randomUUID()}`
    })
    expect(response.statusCode).toBe(403)
  })
})
