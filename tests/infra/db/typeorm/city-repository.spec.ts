import 'reflect-metadata'
import { TypeOrmHelper } from '@/infra/db/typeorm/typeorm-helper'
import { CityTypeOrmRepository } from '@/infra/db/typeorm/city-repository'
import { State } from '@/infra/db/typeorm/entities/state'
import { City } from '@/infra/db/typeorm/entities/city'
import { Neighborhood } from '@/infra/db/typeorm/entities/neighborhood'

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
})
