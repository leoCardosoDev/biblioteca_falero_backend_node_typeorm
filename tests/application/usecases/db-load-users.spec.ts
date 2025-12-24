import { DbLoadUsers } from '@/application/usecases/db-load-users'
import { LoadUsersRepository } from '@/application/protocols/db/load-users-repository'
import { UserModel } from '@/domain/models/user'

const makeFakeUsers = (): UserModel[] => {
  return [{
    id: 'any_id',
    name: 'any_name',
    email: 'any_email@mail.com',
    rg: 'any_rg',
    cpf: 'any_cpf',
    dataNascimento: 'any_date'
  }, {
    id: 'other_id',
    name: 'other_name',
    email: 'other_email@mail.com',
    rg: 'other_rg',
    cpf: 'other_cpf',
    dataNascimento: 'other_date'
  }]
}

const makeLoadUsersRepository = (): LoadUsersRepository => {
  class LoadUsersRepositoryStub implements LoadUsersRepository {
    async loadAll(): Promise<UserModel[]> {
      return await new Promise(resolve => resolve(makeFakeUsers()))
    }
  }
  return new LoadUsersRepositoryStub()
}

interface SutTypes {
  sut: DbLoadUsers
  loadUsersRepositoryStub: LoadUsersRepository
}

const makeSut = (): SutTypes => {
  const loadUsersRepositoryStub = makeLoadUsersRepository()
  const sut = new DbLoadUsers(loadUsersRepositoryStub)
  return {
    sut,
    loadUsersRepositoryStub
  }
}

describe('DbLoadUsers UseCase', () => {
  test('Should call LoadUsersRepository', async () => {
    const { sut, loadUsersRepositoryStub } = makeSut()
    const loadAllSpy = jest.spyOn(loadUsersRepositoryStub, 'loadAll')
    await sut.load()
    expect(loadAllSpy).toHaveBeenCalled()
  })

  test('Should return a list of Users on success', async () => {
    const { sut } = makeSut()
    const users = await sut.load()
    expect(users).toEqual(makeFakeUsers())
  })

  test('Should throw if LoadUsersRepository throws', async () => {
    const { sut, loadUsersRepositoryStub } = makeSut()
    jest.spyOn(loadUsersRepositoryStub, 'loadAll').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
    const promise = sut.load()
    await expect(promise).rejects.toThrow()
  })
})
