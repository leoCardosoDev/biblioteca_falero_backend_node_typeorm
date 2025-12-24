import { DbLoadUsers } from '@/application/usecases/db-load-users'
import { LoadUsersRepository } from '@/application/protocols/db/load-users-repository'
import { UserModel } from '@/domain/models/user'
import { Id } from '@/domain/value-objects/id'
import { Email } from '@/domain/value-objects/email'
import { Cpf } from '@/domain/value-objects/cpf'
import { Name } from '@/domain/value-objects/name'
import { Rg } from '@/domain/value-objects/rg'
import { BirthDate } from '@/domain/value-objects/birth-date'

const makeFakeUsers = (): UserModel[] => {
  return [{
    id: Id.create('550e8400-e29b-41d4-a716-446655440000'),
    name: Name.create('any_name') as Name,
    email: Email.create('any_email@mail.com'),
    rg: Rg.create('123456789') as Rg,
    cpf: Cpf.create('529.982.247-25'),
    birthDate: BirthDate.create('1990-01-15') as BirthDate
  }, {
    id: Id.create('550e8400-e29b-41d4-a716-446655440001'),
    name: Name.create('other_name') as Name,
    email: Email.create('other_email@mail.com'),
    rg: Rg.create('987654321') as Rg,
    cpf: Cpf.create('71428793860'),
    birthDate: BirthDate.create('1985-05-20') as BirthDate
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
