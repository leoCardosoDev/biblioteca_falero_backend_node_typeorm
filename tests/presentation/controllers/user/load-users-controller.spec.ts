import { LoadUsersController } from '@/presentation/controllers/user/load-users-controller'
import { LoadUsers } from '@/domain/usecases/load-users'
import { UserModel } from '@/domain/models/user'
import { ok, serverError } from '@/presentation/helpers/http-helper'

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

const makeLoadUsers = (): LoadUsers => {
  class LoadUsersStub implements LoadUsers {
    async load(): Promise<UserModel[]> {
      return await new Promise(resolve => resolve(makeFakeUsers()))
    }
  }
  return new LoadUsersStub()
}

interface SutTypes {
  sut: LoadUsersController
  loadUsersStub: LoadUsers
}

const makeSut = (): SutTypes => {
  const loadUsersStub = makeLoadUsers()
  const sut = new LoadUsersController(loadUsersStub)
  return {
    sut,
    loadUsersStub
  }
}

describe('LoadUsers Controller', () => {
  test('Should call LoadUsers', async () => {
    const { sut, loadUsersStub } = makeSut()
    const loadSpy = jest.spyOn(loadUsersStub, 'load')
    await sut.handle({})
    expect(loadSpy).toHaveBeenCalled()
  })

  test('Should return 200 on success', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.handle({})
    expect(httpResponse).toEqual(ok(makeFakeUsers()))
  })

  test('Should return 500 if LoadUsers throws', async () => {
    const { sut, loadUsersStub } = makeSut()
    jest.spyOn(loadUsersStub, 'load').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
    const httpResponse = await sut.handle({})
    expect(httpResponse).toEqual(serverError(new Error()))
  })
})
