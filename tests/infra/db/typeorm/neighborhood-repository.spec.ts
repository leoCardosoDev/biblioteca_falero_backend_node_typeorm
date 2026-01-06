import 'reflect-metadata'
import { TypeOrmHelper } from '@/infra/db/typeorm/typeorm-helper'
import { NeighborhoodTypeOrmRepository } from '@/infra/db/typeorm/neighborhood-repository'
import { Neighborhood } from '@/infra/db/typeorm/entities/neighborhood'
import { City } from '@/infra/db/typeorm/entities/city'
import { State } from '@/infra/db/typeorm/entities/state'

describe('NeighborhoodTypeOrmRepository', () => {
  beforeAll(async () => {
    await TypeOrmHelper.connect({
      type: 'better-sqlite3',
      database: ':memory:',
      dropSchema: true,
      entities: [Neighborhood, City, State],
      synchronize: true
    })
  })

  afterAll(async () => {
    await TypeOrmHelper.disconnect()
  })

  beforeEach(async () => {
    const neighborhoodRepo = TypeOrmHelper.getRepository(Neighborhood)
    await neighborhoodRepo.clear()
    const cityRepo = TypeOrmHelper.getRepository(City)
    await cityRepo.clear()
    const stateRepo = TypeOrmHelper.getRepository(State)
    await stateRepo.clear()
  })

  const makeSut = (): NeighborhoodTypeOrmRepository => {
    return new NeighborhoodTypeOrmRepository()
  }

  const makeState = async (): Promise<State> => {
    const repo = TypeOrmHelper.getRepository(State)
    const state = repo.create({
      name: 'Any State',
      uf: 'AS'
    })
    return await repo.save(state)
  }

  const makeCity = async (stateId: string): Promise<City> => {
    const repo = TypeOrmHelper.getRepository(City)
    const city = repo.create({
      name: 'Any City',
      state_id: stateId
    })
    return await repo.save(city)
  }

  test('Should return a neighborhood on add success', async () => {
    const sut = makeSut()
    const state = await makeState()
    const city = await makeCity(state.id)

    const neighborhood = await sut.add('Any Neighborhood', city.id)

    expect(neighborhood).toBeTruthy()
    expect(neighborhood.id.value).toBeTruthy()
    expect(neighborhood.name).toBe('Any Neighborhood')
    expect(neighborhood.cityId.value).toBe(city.id)
  })

  test('Should return a neighborhood on findByNameAndCity success', async () => {
    const sut = makeSut()
    const state = await makeState()
    const city = await makeCity(state.id)
    await sut.add('Any Neighborhood', city.id)

    const neighborhood = await sut.findByNameAndCity('Any Neighborhood', city.id)

    expect(neighborhood).toBeTruthy()
    expect(neighborhood?.name).toBe('Any Neighborhood')
    expect(neighborhood?.cityId.value).toBe(city.id)
  })

  test('Should return undefined if findByNameAndCity finds nothing', async () => {
    const sut = makeSut()
    const state = await makeState()
    const city = await makeCity(state.id)

    const neighborhood = await sut.findByNameAndCity('Any Neighborhood', city.id)

    expect(neighborhood).toBeUndefined()
  })

  test('Should return a neighborhood on loadByNameAndCity success', async () => {
    const sut = makeSut()
    const state = await makeState()
    const city = await makeCity(state.id)
    await sut.add('Any Neighborhood', city.id)

    const neighborhood = await sut.loadByNameAndCity('Any Neighborhood', city.id)

    expect(neighborhood).toBeTruthy()
    expect(neighborhood?.name).toBe('Any Neighborhood')
    expect(neighborhood?.cityId.value).toBe(city.id)
  })
})
