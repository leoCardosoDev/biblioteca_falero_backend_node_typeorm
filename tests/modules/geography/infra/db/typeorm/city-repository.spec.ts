import 'reflect-metadata'
import { TypeOrmHelper } from '@/shared/infra/db/typeorm/typeorm-helper'
import { CityTypeOrmRepository } from '@/modules/geography/infra/db/typeorm/repositories/city-repository'
import { StateTypeOrmEntity as State } from '@/modules/geography/infra/db/typeorm/entities/state'
import { CityTypeOrmEntity as City } from '@/modules/geography/infra/db/typeorm/entities/city'
import { NeighborhoodTypeOrmEntity as Neighborhood } from '@/modules/geography/infra/db/typeorm/entities/neighborhood'

describe('CityTypeOrmRepository', () => {
  beforeAll(async () => {
    await TypeOrmHelper.connect({
      type: 'better-sqlite3',
      database: ':memory:',
      dropSchema: true,
      entities: [State, City, Neighborhood],
      synchronize: true
    })
  })

  afterAll(async () => {
    await TypeOrmHelper.disconnect()
  })

  beforeEach(async () => {
    const cityRepo = TypeOrmHelper.getRepository(City)
    await cityRepo.clear()
    const stateRepo = TypeOrmHelper.getRepository(State)
    await stateRepo.clear()
  })

  const makeSut = (): CityTypeOrmRepository => {
    return new CityTypeOrmRepository()
  }

  const makeState = async (): Promise<State> => {
    const repo = TypeOrmHelper.getRepository(State)
    const state = repo.create({
      name: 'Any State',
      uf: 'AS'
    })
    return await repo.save(state)
  }

  test('Should return a city on add success', async () => {
    const sut = makeSut()
    const state = await makeState()

    const city = await sut.add('Any City', state.id)

    expect(city).toBeTruthy()
    expect(city.id).toBeTruthy()
    expect(city.name).toBe('Any City')
    expect(city.stateId.value).toBe(state.id)
  })

  test('Should return a city on loadByNameAndState success', async () => {
    const sut = makeSut()
    const state = await makeState()
    await sut.add('Any City', state.id)

    const city = await sut.loadByNameAndState('Any City', state.id)

    expect(city).toBeTruthy()
    expect(city?.name).toBe('Any City')
    expect(city?.stateId.value).toBe(state.id)
  })

  test('Should return undefined if loadByNameAndState finds nothing', async () => {
    const sut = makeSut()
    const state = await makeState()

    const city = await sut.loadByNameAndState('Any City', state.id)

    expect(city).toBeUndefined()
  })

  test('Should return a city on loadById success', async () => {
    const sut = makeSut()
    const state = await makeState()
    const addedCity = await sut.add('Any City', state.id)

    const city = await sut.loadById(addedCity.id.value)

    expect(city).toBeTruthy()
    expect(city?.id.value).toBe(addedCity.id.value)
    expect(city?.name).toBe('Any City')
  })

  test('Should return undefined if loadById finds nothing', async () => {
    const sut = makeSut()
    const city = await sut.loadById('550e8400-e29b-41d4-a716-446655440000')
    expect(city).toBeUndefined()
  })
})
