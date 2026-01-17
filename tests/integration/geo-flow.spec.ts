import 'reflect-metadata'
import { TypeOrmHelper } from '@/shared/infra/db/typeorm/typeorm-helper'
import { GetOrCreateGeoEntityService } from '@/modules/geography/domain/services/get-or-create-geo-entity-service'
import { StateTypeOrmRepository } from '@/modules/geography/infra/db/typeorm/repositories/state-repository'
import { CityTypeOrmRepository } from '@/modules/geography/infra/db/typeorm/repositories/city-repository'
import { NeighborhoodTypeOrmRepository } from '@/modules/geography/infra/db/typeorm/repositories/neighborhood-repository'
import { StateTypeOrmEntity as State } from '@/modules/geography/infra/db/typeorm/entities/state'
import { CityTypeOrmEntity as City } from '@/modules/geography/infra/db/typeorm/entities/city'
import { NeighborhoodTypeOrmEntity as Neighborhood } from '@/modules/geography/infra/db/typeorm/entities/neighborhood'

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
    const cityInDb = await cityRepo.loadByNameAndState('Campinas', result1.stateId.value)
    expect(cityInDb).toBeTruthy()
    expect(cityInDb?.id.value).toBe(result1.cityId.value)

    const neighborhoodInDb = await neighborhoodRepo.loadByNameAndCity('Centro', result1.cityId.value)
    expect(neighborhoodInDb).toBeTruthy()
    expect(neighborhoodInDb?.id.value).toBe(result1.neighborhoodId.value)

    // 2. Second Call: Should Return Existing
    const result2 = await sut.perform({
      uf: 'SP',
      city: 'Campinas',
      neighborhood: 'Centro'
    })

    expect(result2.stateId.value).toBe(result1.stateId.value)
    expect(result2.cityId.value).toBe(result1.cityId.value)
    expect(result2.neighborhoodId.value).toBe(result1.neighborhoodId.value)
  })
})
