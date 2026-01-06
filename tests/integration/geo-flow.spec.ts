import 'reflect-metadata'
import { TypeOrmHelper } from '@/infra/db/typeorm/typeorm-helper'
import { GetOrCreateGeoEntityService } from '@/domain/services/geo/get-or-create-geo-entity-service'
import { StateTypeOrmRepository } from '@/infra/db/typeorm/state-repository'
import { CityTypeOrmRepository } from '@/infra/db/typeorm/city-repository'
import { NeighborhoodTypeOrmRepository } from '@/infra/db/typeorm/neighborhood-repository'
import { State } from '@/infra/db/typeorm/entities/state'
import { City } from '@/infra/db/typeorm/entities/city'
import { Neighborhood } from '@/infra/db/typeorm/entities/neighborhood'

describe('Geography Integration Flow', () => {
  let sut: GetOrCreateGeoEntityService
  let stateRepo: StateTypeOrmRepository
  let cityRepo: CityTypeOrmRepository
  let neighborhoodRepo: NeighborhoodTypeOrmRepository

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
    // Clear in reverse order of dependencies (Neighborhood -> City -> State) to avoid FK constraint violations
    await TypeOrmHelper.getRepository(Neighborhood).clear()
    await TypeOrmHelper.getRepository(City).clear()
    await TypeOrmHelper.getRepository(State).clear()

    stateRepo = new StateTypeOrmRepository()
    cityRepo = new CityTypeOrmRepository()
    neighborhoodRepo = new NeighborhoodTypeOrmRepository()
    sut = new GetOrCreateGeoEntityService(
      stateRepo,
      cityRepo,
      cityRepo,
      neighborhoodRepo,
      neighborhoodRepo
    )

    // Seed a State
    const typeOrmStateRepo = TypeOrmHelper.getRepository(State)
    await typeOrmStateRepo.save(typeOrmStateRepo.create({ name: 'São Paulo', uf: 'SP' }))
  })

  test('Should persist new City and Neighborhood and return existing IDs on second call', async () => {
    // 1. First Call: Should Create
    const result1 = await sut.perform({
      uf: 'SP',
      city: 'Campinas',
      neighborhood: 'Centro'
    })

    expect(result1.stateId).toBeTruthy()
    expect(result1.cityId).toBeTruthy()
    expect(result1.neighborhoodId).toBeTruthy()

    // Verify DB
    const cityInDb = await cityRepo.loadByNameAndState('Campinas', result1.stateId)
    expect(cityInDb).toBeTruthy()
    expect(cityInDb?.id.value).toBe(result1.cityId)

    const neighborhoodInDb = await neighborhoodRepo.loadByNameAndCity('Centro', result1.cityId)
    expect(neighborhoodInDb).toBeTruthy()
    expect(neighborhoodInDb?.id.value).toBe(result1.neighborhoodId)

    // 2. Second Call: Should Return Existing
    const result2 = await sut.perform({
      uf: 'SP',
      city: 'Campinas',
      neighborhood: 'Centro'
    })

    expect(result2.stateId).toBe(result1.stateId)
    expect(result2.cityId).toBe(result1.cityId)
    expect(result2.neighborhoodId).toBe(result1.neighborhoodId)
  })
})
