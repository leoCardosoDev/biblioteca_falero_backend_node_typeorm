import { DbAddNeighborhood } from '@/application/usecases/db-add-neighborhood'
import { AddNeighborhoodRepository } from '@/application/protocols/db/neighborhood/add-neighborhood-repository'
import { NeighborhoodModel } from '@/domain/models/neighborhood'
import { Id } from '@/domain/value-objects/id'

const makeAddNeighborhoodRepository = (): AddNeighborhoodRepository => {
  class AddNeighborhoodRepositoryStub implements AddNeighborhoodRepository {
    async findByNameAndCity(_name: string, _cityId: string): Promise<NeighborhoodModel | undefined> {
      return undefined
    }

    async add(name: string, cityId: string): Promise<NeighborhoodModel> {
      return {
        id: Id.create('550e8400-e29b-41d4-a716-446655440000'),
        name,
        cityId: Id.create(cityId)
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
    await sut.add({ name: 'any_name', cityId: '550e8400-e29b-41d4-a716-446655440003' })
    expect(findSpy).toHaveBeenCalledWith('any_name', '550e8400-e29b-41d4-a716-446655440003')
  })

  test('Should return existing neighborhood if findByNameAndCity returns one', async () => {
    const { sut, addNeighborhoodRepositoryStub } = makeSut()
    jest.spyOn(addNeighborhoodRepositoryStub, 'findByNameAndCity').mockReturnValueOnce(Promise.resolve({
      id: Id.create('550e8400-e29b-41d4-a716-446655440000'),
      name: 'existing_name',
      cityId: Id.create('550e8400-e29b-41d4-a716-446655440001')
    }))
    const result = await sut.add({ name: 'any_name', cityId: '550e8400-e29b-41d4-a716-446655440003' })
    expect(result).toEqual({
      id: Id.create('550e8400-e29b-41d4-a716-446655440000'),
      name: 'existing_name',
      cityId: Id.create('550e8400-e29b-41d4-a716-446655440001')
    })
  })

  test('Should call add with correct values if neighborhood does not exist', async () => {
    const { sut, addNeighborhoodRepositoryStub } = makeSut()
    const addSpy = jest.spyOn(addNeighborhoodRepositoryStub, 'add')
    await sut.add({ name: 'any_name', cityId: '550e8400-e29b-41d4-a716-446655440003' })
    expect(addSpy).toHaveBeenCalledWith('any_name', '550e8400-e29b-41d4-a716-446655440003')
  })

  test('Should return the created neighborhood on success', async () => {
    const { sut } = makeSut()
    const result = await sut.add({ name: 'any_name', cityId: '550e8400-e29b-41d4-a716-446655440003' })
    expect(result).toEqual({
      id: Id.create('550e8400-e29b-41d4-a716-446655440000'),
      name: 'any_name',
      cityId: Id.create('550e8400-e29b-41d4-a716-446655440003')
    })
  })

  test('Should throw if repository throws', async () => {
    const { sut, addNeighborhoodRepositoryStub } = makeSut()
    jest.spyOn(addNeighborhoodRepositoryStub, 'findByNameAndCity').mockImplementationOnce(async () => {
      throw new Error()
    })
    const promise = sut.add({ name: 'any_name', cityId: '550e8400-e29b-41d4-a716-446655440003' })
    await expect(promise).rejects.toThrow()
  })
})
