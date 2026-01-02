import { DbAddNeighborhood } from '@/application/usecases/db-add-neighborhood'
import { AddNeighborhoodRepository } from '@/application/protocols/db/neighborhood/add-neighborhood-repository'
import { NeighborhoodModel } from '@/domain/models/neighborhood'

const makeAddNeighborhoodRepository = (): AddNeighborhoodRepository => {
  class AddNeighborhoodRepositoryStub implements AddNeighborhoodRepository {
    async findByNameAndCity(name: string, cityId: string): Promise<NeighborhoodModel | undefined> {
      return undefined
    }

    async add(name: string, cityId: string): Promise<NeighborhoodModel> {
      return {
        id: 'any_id',
        name,
        cityId
      }
    }
  }
  return new AddNeighborhoodRepositoryStub()
}

interface SutTypes {
  sut: DbAddNeighborhood
  addNeighborhoodRepositoryStub: AddNeighborhoodRepository
}

const makeSut = (): SutTypes => {
  const addNeighborhoodRepositoryStub = makeAddNeighborhoodRepository()
  const sut = new DbAddNeighborhood(addNeighborhoodRepositoryStub)
  return {
    sut,
    addNeighborhoodRepositoryStub
  }
}

describe('DbAddNeighborhood UseCase', () => {
  test('Should call findByNameAndCity with correct values', async () => {
    const { sut, addNeighborhoodRepositoryStub } = makeSut()
    const findSpy = jest.spyOn(addNeighborhoodRepositoryStub, 'findByNameAndCity')
    await sut.add({ name: 'any_name', cityId: 'any_city_id' })
    expect(findSpy).toHaveBeenCalledWith('any_name', 'any_city_id')
  })

  test('Should return existing neighborhood if findByNameAndCity returns one', async () => {
    const { sut, addNeighborhoodRepositoryStub } = makeSut()
    jest.spyOn(addNeighborhoodRepositoryStub, 'findByNameAndCity').mockReturnValueOnce(Promise.resolve({
      id: 'existing_id',
      name: 'existing_name',
      cityId: 'existing_city_id'
    }))
    const result = await sut.add({ name: 'any_name', cityId: 'any_city_id' })
    expect(result).toEqual({
      id: 'existing_id',
      name: 'existing_name',
      cityId: 'existing_city_id'
    })
  })

  test('Should call add with correct values if neighborhood does not exist', async () => {
    const { sut, addNeighborhoodRepositoryStub } = makeSut()
    const addSpy = jest.spyOn(addNeighborhoodRepositoryStub, 'add')
    await sut.add({ name: 'any_name', cityId: 'any_city_id' })
    expect(addSpy).toHaveBeenCalledWith('any_name', 'any_city_id')
  })

  test('Should return the created neighborhood on success', async () => {
    const { sut } = makeSut()
    const result = await sut.add({ name: 'any_name', cityId: 'any_city_id' })
    expect(result).toEqual({
      id: 'any_id',
      name: 'any_name',
      cityId: 'any_city_id'
    })
  })

  test('Should throw if repository throws', async () => {
    const { sut, addNeighborhoodRepositoryStub } = makeSut()
    jest.spyOn(addNeighborhoodRepositoryStub, 'findByNameAndCity').mockImplementationOnce(async () => {
      throw new Error()
    })
    const promise = sut.add({ name: 'any_name', cityId: 'any_city_id' })
    await expect(promise).rejects.toThrow()
  })
})
