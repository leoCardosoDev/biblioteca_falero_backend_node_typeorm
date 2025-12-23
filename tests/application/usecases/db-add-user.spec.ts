import { DbAddUser } from '@/application/usecases/db-add-user'
import { AddUserRepository } from '@/application/protocols/add-user-repository'
import { UserModel } from '@/domain/models/user'
import { AddUserParams } from '@/domain/usecases/add-user'

import { LoadUserByEmailRepository } from '@/application/protocols/db/load-user-by-email-repository'
import { LoadUserByCpfRepository } from '@/application/protocols/db/load-user-by-cpf-repository'
import { EmailInUseError, CpfInUseError } from '@/presentation/errors'

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
    async add(data: AddUserParams): Promise<UserModel> {
      const fakeUser: UserModel = {
        id: 'valid_id',
        name: data.name,
        email: data.email,
        rg: data.rg,
        cpf: data.cpf,
        dataNascimento: data.dataNascimento
      }
      return Promise.resolve(fakeUser)
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

describe('DbAddUser UseCase', () => {
  test('Should call LoadUserByEmailRepository with correct email', async () => {
    const { sut, loadUserByEmailRepositoryStub } = makeSut()
    const loadSpy = jest.spyOn(loadUserByEmailRepositoryStub, 'loadByEmail')
    const userData = {
      name: 'valid_name',
      email: 'valid_email@mail.com',
      rg: 'valid_rg',
      cpf: 'valid_cpf',
      dataNascimento: new Date('1990-01-15')
    }
    await sut.add(userData)
    expect(loadSpy).toHaveBeenCalledWith('valid_email@mail.com')
  })

  test('Should return EmailInUseError if LoadUserByEmailRepository returns an account', async () => {
    const { sut, loadUserByEmailRepositoryStub } = makeSut()
    jest.spyOn(loadUserByEmailRepositoryStub, 'loadByEmail').mockReturnValueOnce(Promise.resolve({
      id: 'any_id',
      name: 'any_name',
      email: 'valid_email@mail.com',
      rg: 'any_rg',
      cpf: 'any_cpf',
      dataNascimento: new Date()
    }))
    const userData = {
      name: 'valid_name',
      email: 'valid_email@mail.com',
      rg: 'valid_rg',
      cpf: 'valid_cpf',
      dataNascimento: new Date('1990-01-15')
    }
    const response = await sut.add(userData)
    expect(response).toEqual(new EmailInUseError())
  })

  test('Should call LoadUserByCpfRepository with correct cpf', async () => {
    const { sut, loadUserByCpfRepositoryStub } = makeSut()
    const loadSpy = jest.spyOn(loadUserByCpfRepositoryStub, 'loadByCpf')
    const userData = {
      name: 'valid_name',
      email: 'valid_email@mail.com',
      rg: 'valid_rg',
      cpf: 'valid_cpf',
      dataNascimento: new Date('1990-01-15')
    }
    await sut.add(userData)
    expect(loadSpy).toHaveBeenCalledWith('valid_cpf')
  })

  test('Should return CpfInUseError if LoadUserByCpfRepository returns an account', async () => {
    const { sut, loadUserByCpfRepositoryStub } = makeSut()
    jest.spyOn(loadUserByCpfRepositoryStub, 'loadByCpf').mockReturnValueOnce(Promise.resolve({
      id: 'any_id',
      name: 'any_name',
      email: 'any_email@mail.com',
      rg: 'any_rg',
      cpf: 'valid_cpf',
      dataNascimento: new Date()
    }))
    const userData = {
      name: 'valid_name',
      email: 'valid_email@mail.com',
      rg: 'valid_rg',
      cpf: 'valid_cpf',
      dataNascimento: new Date('1990-01-15')
    }
    const response = await sut.add(userData)
    expect(response).toEqual(new CpfInUseError())
  })

  test('Should call AddUserRepository with correct values', async () => {
    const { sut, addUserRepositoryStub } = makeSut()
    const addSpy = jest.spyOn(addUserRepositoryStub, 'add')
    const userData = {
      name: 'valid_name',
      email: 'valid_email@mail.com',
      rg: 'valid_rg',
      cpf: 'valid_cpf',
      dataNascimento: new Date('1990-01-15')
    }
    await sut.add(userData)
    expect(addSpy).toHaveBeenCalledWith(userData)
  })

  test('Should throw if AddUserRepository throws', async () => {
    const { sut, addUserRepositoryStub } = makeSut()
    jest.spyOn(addUserRepositoryStub, 'add').mockReturnValueOnce(Promise.reject(new Error()))
    const userData = {
      name: 'valid_name',
      email: 'valid_email@mail.com',
      rg: 'valid_rg',
      cpf: 'valid_cpf',
      dataNascimento: new Date('1990-01-15')
    }
    const promise = sut.add(userData)
    await expect(promise).rejects.toThrow()
  })

  test('Should return an account on success', async () => {
    const { sut } = makeSut()
    const userData = {
      name: 'valid_name',
      email: 'valid_email@mail.com',
      rg: 'valid_rg',
      cpf: 'valid_cpf',
      dataNascimento: new Date('1990-01-15')
    }
    const account = await sut.add(userData)
    expect(account).toEqual({
      id: 'valid_id',
      name: 'valid_name',
      email: 'valid_email@mail.com',
      rg: 'valid_rg',
      cpf: 'valid_cpf',
      dataNascimento: new Date('1990-01-15')
    })
  })
})
