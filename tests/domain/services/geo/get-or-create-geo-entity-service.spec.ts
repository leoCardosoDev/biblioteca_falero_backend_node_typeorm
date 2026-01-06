import { GetOrCreateGeoEntityService } from '@/domain/services/geo/get-or-create-geo-entity-service'
import { LoadStateByUfRepository } from '@/application/protocols/db/state/load-state-by-uf-repository'
import { LoadCityByNameAndStateRepository } from '@/application/protocols/db/city/load-city-by-name-and-state-repository'
import { AddCityRepository } from '@/application/protocols/db/city/add-city-repository'
import { LoadNeighborhoodByNameAndCityRepository } from '@/application/protocols/db/neighborhood/load-neighborhood-by-name-and-city-repository'
import { AddNeighborhoodRepository } from '@/application/protocols/db/neighborhood/add-neighborhood-repository'
import { StateModel } from '@/domain/models/state'
import { CityModel } from '@/domain/models/city'
import { NeighborhoodModel } from '@/domain/models/neighborhood'
import { Id } from '@/domain/value-objects/id'

// Mocks
const STATE_ID = '550e8400-e29b-41d4-a716-446655440000'
const CITY_ID = '550e8400-e29b-41d4-a716-446655440001'
const NEW_CITY_ID = '550e8400-e29b-41d4-a716-446655440002'
const NEIGHBORHOOD_ID = '550e8400-e29b-41d4-a716-446655440003'
const NEW_NEIGHBORHOOD_ID = '550e8400-e29b-41d4-a716-446655440004'

const makeLoadStateByUfRepository = (): LoadStateByUfRepository => {
  class LoadStateByUfRepositoryStub implements LoadStateByUfRepository {
    async loadByUf(uf: string): Promise<StateModel> {
      return Promise.resolve({
        id: Id.create(STATE_ID) as Id,
        name: 'Any State',
        uf
      })
    }
  }
  return new LoadStateByUfRepositoryStub()
}

const makeLoadCityByNameAndStateRepository = (): LoadCityByNameAndStateRepository => {
  class LoadCityByNameAndStateRepositoryStub implements LoadCityByNameAndStateRepository {
    async loadByNameAndState(name: string, stateId: string): Promise<CityModel | undefined> {
      return Promise.resolve({
        id: Id.create(CITY_ID) as Id,
        name,
        stateId: Id.create(stateId) as Id
      })
    }
  }
  return new LoadCityByNameAndStateRepositoryStub()
}

const makeAddCityRepository = (): AddCityRepository => {
  class AddCityRepositoryStub implements AddCityRepository {
    async add(name: string, stateId: string): Promise<CityModel> {
      return Promise.resolve({
        id: Id.create(NEW_CITY_ID) as Id,
        name,
        stateId: Id.create(stateId) as Id
      })
    }
  }
  return new AddCityRepositoryStub()
}

const makeLoadNeighborhoodByNameAndCityRepository = (): LoadNeighborhoodByNameAndCityRepository => {
  class LoadNeighborhoodByNameAndCityRepositoryStub implements LoadNeighborhoodByNameAndCityRepository {
    async loadByNameAndCity(name: string, cityId: string): Promise<NeighborhoodModel | undefined> {
      return Promise.resolve({
        id: Id.create(NEIGHBORHOOD_ID) as Id,
        name,
        cityId: Id.create(cityId) as Id
      })
    }
  }
  return new LoadNeighborhoodByNameAndCityRepositoryStub()
}

const makeAddNeighborhoodRepository = (): AddNeighborhoodRepository => {
  class AddNeighborhoodRepositoryStub implements AddNeighborhoodRepository {
    async findByNameAndCity(_name: string, _cityId: string): Promise<NeighborhoodModel | undefined> {
      return undefined
    }
    async add(name: string, cityId: string): Promise<NeighborhoodModel> {
      return Promise.resolve({
        id: Id.create(NEW_NEIGHBORHOOD_ID) as Id,
        name,
        cityId: Id.create(cityId) as Id
      })
    }
  }
  return new AddNeighborhoodRepositoryStub()
}

type SutTypes = {
  sut: GetOrCreateGeoEntityService
  loadStateByUfRepositoryStub: LoadStateByUfRepository
  loadCityByNameAndStateRepositoryStub: LoadCityByNameAndStateRepository
  addCityRepositoryStub: AddCityRepository
  loadNeighborhoodByNameAndCityRepositoryStub: LoadNeighborhoodByNameAndCityRepository
  addNeighborhoodRepositoryStub: AddNeighborhoodRepository
}

const makeSut = (): SutTypes => {
  const loadStateByUfRepositoryStub = makeLoadStateByUfRepository()
  const loadCityByNameAndStateRepositoryStub = makeLoadCityByNameAndStateRepository()
  const addCityRepositoryStub = makeAddCityRepository()
  const loadNeighborhoodByNameAndCityRepositoryStub = makeLoadNeighborhoodByNameAndCityRepository()
  const addNeighborhoodRepositoryStub = makeAddNeighborhoodRepository()

  const sut = new GetOrCreateGeoEntityService(
    loadStateByUfRepositoryStub,
    loadCityByNameAndStateRepositoryStub,
    addCityRepositoryStub,
    loadNeighborhoodByNameAndCityRepositoryStub,
    addNeighborhoodRepositoryStub
  )

  return {
    sut,
    loadStateByUfRepositoryStub,
    loadCityByNameAndStateRepositoryStub,
    addCityRepositoryStub,
    loadNeighborhoodByNameAndCityRepositoryStub,
    addNeighborhoodRepositoryStub
  }
}

describe('GetOrCreateGeoEntityService', () => {
  test('Should return geo IDs if all entities exist', async () => {
    const { sut } = makeSut()
    const result = await sut.perform({
      uf: 'SP',
      city: 'Any City',
      neighborhood: 'Any Neighborhood'
    })
    expect(result).toEqual({
      stateId: STATE_ID,
      cityId: CITY_ID,
      neighborhoodId: NEIGHBORHOOD_ID
    })
  })

  test('Should call LoadStateByUfRepository with correct UF', async () => {
    const { sut, loadStateByUfRepositoryStub } = makeSut()
    const loadByUfSpy = jest.spyOn(loadStateByUfRepositoryStub, 'loadByUf')
    await sut.perform({
      uf: 'SP',
      city: 'Any City',
      neighborhood: 'Any Neighborhood'
    })
    expect(loadByUfSpy).toHaveBeenCalledWith('SP')
  })

  test('Should throw if LoadStateByUfRepository returns null', async () => {
    const { sut, loadStateByUfRepositoryStub } = makeSut()
    jest.spyOn(loadStateByUfRepositoryStub, 'loadByUf').mockResolvedValueOnce(Promise.resolve(undefined as unknown as StateModel)) // Force undefined
    const promise = sut.perform({
      uf: 'INVALID',
      city: 'Any City',
      neighborhood: 'Any Neighborhood'
    })
    await expect(promise).rejects.toThrow(new Error('State not found for UF: INVALID'))
  })

  test('Should add city if LoadCityByNameAndStateRepository returns undefined', async () => {
    const { sut, loadCityByNameAndStateRepositoryStub, addCityRepositoryStub } = makeSut()
    jest.spyOn(loadCityByNameAndStateRepositoryStub, 'loadByNameAndState').mockResolvedValueOnce(undefined)
    const addSpy = jest.spyOn(addCityRepositoryStub, 'add')

    const result = await sut.perform({
      uf: 'SP',
      city: 'New City',
      neighborhood: 'Any Neighborhood'
    })

    expect(addSpy).toHaveBeenCalledWith('New City', STATE_ID)
    expect(result.cityId).toBe(NEW_CITY_ID)
  })

  test('Should add neighborhood if LoadNeighborhoodByNameAndCityRepository returns undefined', async () => {
    const { sut, loadNeighborhoodByNameAndCityRepositoryStub, addNeighborhoodRepositoryStub } = makeSut()
    jest.spyOn(loadNeighborhoodByNameAndCityRepositoryStub, 'loadByNameAndCity').mockResolvedValueOnce(undefined)
    const addSpy = jest.spyOn(addNeighborhoodRepositoryStub, 'add')

    const result = await sut.perform({
      uf: 'SP',
      city: 'Any City',
      neighborhood: 'New Neighborhood'
    })

    expect(addSpy).toHaveBeenCalledWith('New Neighborhood', CITY_ID)
    expect(result.neighborhoodId).toBe(NEW_NEIGHBORHOOD_ID)
  })
})
