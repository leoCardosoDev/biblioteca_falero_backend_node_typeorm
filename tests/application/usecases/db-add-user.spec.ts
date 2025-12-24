import { DbAddUser } from '@/application/usecases/db-add-user'
import { AddUserRepository } from '@/application/protocols/add-user-repository'
import { UserModel } from '@/domain/models/user'
import { AddUserParams } from '@/domain/usecases/add-user'
import { LoadUserByEmailRepository } from '@/application/protocols/db/load-user-by-email-repository'
import { LoadUserByCpfRepository } from '@/application/protocols/db/load-user-by-cpf-repository'
import { EmailInUseError, CpfInUseError } from '@/presentation/errors'
import { Id } from '@/domain/value-objects/id'
import { Email } from '@/domain/value-objects/email'
import { Cpf } from '@/domain/value-objects/cpf'

const makeFakeUser = (): UserModel => ({
  id: Id.create('550e8400-e29b-41d4-a716-446655440000'),
  name: 'valid_name',
  email: Email.create('valid_email@mail.com'),
  rg: 'valid_rg',
  cpf: Cpf.create('529.982.247-25'),
  dataNascimento: '1990-01-15'
})

const makeLoadUserByEmailRepository = (): LoadUserByEmailRepository => {
  class LoadUserByEmailRepositoryStub implements LoadUserByEmailRepository {
    async loadByEmail(_email: string): Promise<UserModel | undefined> {
      return Promise.resolve(undefined)
    }
  }
  return new LoadUserByEmailRepositoryStub()
}

const makeLoadUserByCpfRepository = (): LoadUserByCpfRepository => {
  class LoadUserByCpfRepositoryStub implements LoadUserByCpfRepository {
    async loadByCpf(_cpf: string): Promise<UserModel | undefined> {
      return Promise.resolve(undefined)
    }
  }
  return new LoadUserByCpfRepositoryStub()
}

const makeAddUserRepository = (): AddUserRepository => {
  class AddUserRepositoryStub implements AddUserRepository {
    async add(_data: AddUserParams): Promise<UserModel> {
      return Promise.resolve(makeFakeUser())
    }
  }
  return new AddUserRepositoryStub()
}

interface SutTypes {
  sut: DbAddUser
  addUserRepositoryStub: AddUserRepository
  loadUserByEmailRepositoryStub: LoadUserByEmailRepository
  loadUserByCpfRepositoryStub: LoadUserByCpfRepository
}

const makeSut = (): SutTypes => {
  const addUserRepositoryStub = makeAddUserRepository()
  const loadUserByEmailRepositoryStub = makeLoadUserByEmailRepository()
  const loadUserByCpfRepositoryStub = makeLoadUserByCpfRepository()
  const sut = new DbAddUser(addUserRepositoryStub, loadUserByEmailRepositoryStub, loadUserByCpfRepositoryStub)
  return {
    sut,
    addUserRepositoryStub,
    loadUserByEmailRepositoryStub,
    loadUserByCpfRepositoryStub
  }
}

const makeFakeUserData = (): AddUserParams => ({
  name: 'valid_name',
  email: Email.create('valid_email@mail.com'),
  rg: 'valid_rg',
  cpf: Cpf.create('529.982.247-25'),
  dataNascimento: '1990-01-15'
})

describe('DbAddUser UseCase', () => {
  test('Should call LoadUserByEmailRepository with correct email', async () => {
    const { sut, loadUserByEmailRepositoryStub } = makeSut()
    const loadSpy = jest.spyOn(loadUserByEmailRepositoryStub, 'loadByEmail')
    await sut.add(makeFakeUserData())
    expect(loadSpy).toHaveBeenCalledWith('valid_email@mail.com')
  })

  test('Should return EmailInUseError if LoadUserByEmailRepository returns an account', async () => {
    const { sut, loadUserByEmailRepositoryStub } = makeSut()
    jest.spyOn(loadUserByEmailRepositoryStub, 'loadByEmail').mockReturnValueOnce(Promise.resolve(makeFakeUser()))
    const response = await sut.add(makeFakeUserData())
    expect(response).toEqual(new EmailInUseError())
  })

  test('Should call LoadUserByCpfRepository with correct cpf', async () => {
    const { sut, loadUserByCpfRepositoryStub } = makeSut()
    const loadSpy = jest.spyOn(loadUserByCpfRepositoryStub, 'loadByCpf')
    await sut.add(makeFakeUserData())
    expect(loadSpy).toHaveBeenCalledWith('52998224725')
  })

  test('Should return CpfInUseError if LoadUserByCpfRepository returns an account', async () => {
    const { sut, loadUserByCpfRepositoryStub } = makeSut()
    jest.spyOn(loadUserByCpfRepositoryStub, 'loadByCpf').mockReturnValueOnce(Promise.resolve(makeFakeUser()))
    const response = await sut.add(makeFakeUserData())
    expect(response).toEqual(new CpfInUseError())
  })

  test('Should call AddUserRepository with correct values', async () => {
    const { sut, addUserRepositoryStub } = makeSut()
    const addSpy = jest.spyOn(addUserRepositoryStub, 'add')
    const userData = makeFakeUserData()
    await sut.add(userData)
    expect(addSpy).toHaveBeenCalledWith(userData)
  })

  test('Should throw if AddUserRepository throws', async () => {
    const { sut, addUserRepositoryStub } = makeSut()
    jest.spyOn(addUserRepositoryStub, 'add').mockReturnValueOnce(Promise.reject(new Error()))
    const promise = sut.add(makeFakeUserData())
    await expect(promise).rejects.toThrow()
  })

  test('Should return an account on success', async () => {
    const { sut } = makeSut()
    const account = await sut.add(makeFakeUserData())
    expect(account).toEqual(makeFakeUser())
  })
})
