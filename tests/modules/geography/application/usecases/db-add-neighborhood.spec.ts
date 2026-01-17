import { DbAddNeighborhood } from '@/modules/geography/application/usecases/db-add-neighborhood'
import { AddNeighborhoodRepository } from '@/modules/geography/application/protocols/db/neighborhood/load-neighborhood-by-id-repository'
import { Neighborhood } from '@/modules/geography/domain'
import { Id } from '@/shared/domain/value-objects/id'

const makeAddNeighborhoodRepository = (): AddNeighborhoodRepository => {
  class AddNeighborhoodRepositoryStub implements AddNeighborhoodRepository {
    async findByNameAndCity(_name: string, _cityId: string): Promise<Neighborhood | undefined> {
      return undefined
    }

    async add(name: string, cityId: string): Promise<Neighborhood> {
      return Neighborhood.restore({
        id: Id.restore('550e8400-e29b-41d4-a716-446655440000'),
        name,
        cityId: Id.restore(cityId)
      })
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
    await sut.add({ name: '  any_name  ', cityId: '550e8400-e29b-41d4-a716-446655440003' })
    expect(findSpy).toHaveBeenCalledWith('ANY_NAME', '550e8400-e29b-41d4-a716-446655440003')
  })

  test('Should return existing neighborhood if findByNameAndCity returns one', async () => {
    const { sut, addNeighborhoodRepositoryStub } = makeSut()
    const existingNeighborhood = Neighborhood.restore({
      id: Id.restore('550e8400-e29b-41d4-a716-446655440000'),
      name: 'EXISTING_NAME',
      cityId: Id.restore('550e8400-e29b-41d4-a716-446655440001')
    })
    jest.spyOn(addNeighborhoodRepositoryStub, 'findByNameAndCity').mockReturnValueOnce(Promise.resolve(existingNeighborhood))
    const result = await sut.add({ name: 'any_name', cityId: '550e8400-e29b-41d4-a716-446655440003' })
    expect(result.id.value).toBe('550e8400-e29b-41d4-a716-446655440000')
    expect(result.name).toBe('EXISTING_NAME')
    expect(result.cityId.value).toBe('550e8400-e29b-41d4-a716-446655440001')
  })

  test('Should call add with correct values if neighborhood does not exist', async () => {
    const { sut, addNeighborhoodRepositoryStub } = makeSut()
    const addSpy = jest.spyOn(addNeighborhoodRepositoryStub, 'add')
    await sut.add({ name: '  any_name  ', cityId: '550e8400-e29b-41d4-a716-446655440003' })
    expect(addSpy).toHaveBeenCalledWith('ANY_NAME', '550e8400-e29b-41d4-a716-446655440003')
  })

  test('Should return the created neighborhood on success', async () => {
    const { sut } = makeSut()
    const result = await sut.add({ name: '  any_name  ', cityId: '550e8400-e29b-41d4-a716-446655440003' })
    expect(result.id.value).toBe('550e8400-e29b-41d4-a716-446655440000')
    expect(result.name).toBe('ANY_NAME')
    expect(result.cityId.value).toBe('550e8400-e29b-41d4-a716-446655440003')
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
