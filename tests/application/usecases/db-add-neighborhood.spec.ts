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
    await sut.add({ name: '  any_name  ', cityId: '550e8400-e29b-41d4-a716-446655440003' }) // Input with spaces
    expect(findSpy).toHaveBeenCalledWith('ANY_NAME', '550e8400-e29b-41d4-a716-446655440003') // Expect normalized
  })

  test('Should return existing neighborhood if findByNameAndCity returns one', async () => {
    const { sut, addNeighborhoodRepositoryStub } = makeSut()
    jest.spyOn(addNeighborhoodRepositoryStub, 'findByNameAndCity').mockReturnValueOnce(Promise.resolve({
      id: Id.create('550e8400-e29b-41d4-a716-446655440000'),
      name: 'EXISTING_NAME',
      cityId: Id.create('550e8400-e29b-41d4-a716-446655440001')
    }))
    const result = await sut.add({ name: 'any_name', cityId: '550e8400-e29b-41d4-a716-446655440003' })
    expect(result).toEqual({
      id: Id.create('550e8400-e29b-41d4-a716-446655440000'),
      name: 'EXISTING_NAME',
      cityId: Id.create('550e8400-e29b-41d4-a716-446655440001')
    })
  })

  test('Should call add with correct values if neighborhood does not exist', async () => {
    const { sut, addNeighborhoodRepositoryStub } = makeSut()
    const addSpy = jest.spyOn(addNeighborhoodRepositoryStub, 'add')
    await sut.add({ name: '  any_name  ', cityId: '550e8400-e29b-41d4-a716-446655440003' })
    expect(addSpy).toHaveBeenCalledWith('ANY_NAME', '550e8400-e29b-41d4-a716-446655440003')
  })

  test('Should return the created neighborhood on success', async () => {
    const { sut } = makeSut()
    // Mock add to return what was passed (or similar) - strict expectation in repositoryStub is static though.
    // The stub returns "name" passed to it. In makeAddNeighborhoodRepositoryStub:
    // async add(name: string, cityId: string) { return { name, ... } }

    const result = await sut.add({ name: '  any_name  ', cityId: '550e8400-e29b-41d4-a716-446655440003' })
    expect(result).toEqual({
      id: Id.create('550e8400-e29b-41d4-a716-446655440000'),
      name: 'ANY_NAME',
      cityId: Id.create('550e8400-e29b-41d4-a716-446655440003')
    })
  })

  test('Should throw if Neighborhood VO creation fails', async () => {
    const { sut } = makeSut()
    const promise = sut.add({ name: '', cityId: '550e8400-e29b-41d4-a716-446655440003' })
    await expect(promise).rejects.toThrow()
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
