import { DbLoadUserById } from '@/application/usecases/db-load-user-by-id'
import { LoadUserByIdRepository } from '@/application/protocols/db/load-user-by-id-repository'
import { UserModel } from '@/domain/models/user'
import { Id } from '@/domain/value-objects/id'
import { Name } from '@/domain/value-objects/name'
import { Email } from '@/domain/value-objects/email'
import { Rg } from '@/domain/value-objects/rg'
import { Cpf } from '@/domain/value-objects/cpf'
// removed BirthDate import

const makeFakeUser = (): UserModel => ({
  id: Id.create('550e8400-e29b-41d4-a716-446655440000'),
  name: Name.create('any_name') as Name,
  email: Email.create('any_email@mail.com'),
  rg: Rg.create('123456789') as Rg,
  cpf: Cpf.create('529.982.247-25'),
  gender: 'male'
})

const fakeUserById = makeFakeUser()

const makeLoadUserByIdRepository = (): LoadUserByIdRepository => {
  class LoadUserByIdRepositoryStub implements LoadUserByIdRepository {
    async loadById(_id: string): Promise<UserModel | null> {
      return Promise.resolve(fakeUserById)
    }
  }
  return new LoadUserByIdRepositoryStub()
}

interface SutTypes {
  sut: DbLoadUserById
  loadUserByIdRepositoryStub: LoadUserByIdRepository
}

const makeSut = (): SutTypes => {
  const loadUserByIdRepositoryStub = makeLoadUserByIdRepository()
  const sut = new DbLoadUserById(loadUserByIdRepositoryStub)
  return {
    sut,
    loadUserByIdRepositoryStub
  }
}

describe('DbLoadUserById UseCase', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('Should call LoadUserByIdRepository with correct id', async () => {
    const { sut, loadUserByIdRepositoryStub } = makeSut()
    const loadByIdSpy = jest.spyOn(loadUserByIdRepositoryStub, 'loadById')
    await sut.load('any_id')
    expect(loadByIdSpy).toHaveBeenCalledWith('any_id')
  })

  test('Should return null if LoadUserByIdRepository returns null', async () => {
    const { sut, loadUserByIdRepositoryStub } = makeSut()
    jest.spyOn(loadUserByIdRepositoryStub, 'loadById').mockResolvedValueOnce(null)
    const user = await sut.load('any_id')
    expect(user).toBeNull()
  })

  test('Should return a user on success', async () => {
    const { sut } = makeSut()
    const user = await sut.load('any_id')
    expect(user).toBe(fakeUserById)
  })

  test('Should throw if LoadUserByIdRepository throws', async () => {
    const { sut, loadUserByIdRepositoryStub } = makeSut()
    jest.spyOn(loadUserByIdRepositoryStub, 'loadById').mockRejectedValueOnce(new Error())
    const promise = sut.load('any_id')
    await expect(promise).rejects.toThrow()
  })
})
