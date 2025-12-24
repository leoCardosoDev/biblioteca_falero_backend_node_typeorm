import { LoadUsersController } from '@/presentation/controllers/user/load-users-controller'
import { LoadUsers } from '@/domain/usecases/load-users'
import { UserModel } from '@/domain/models/user'
import { serverError } from '@/presentation/helpers/http-helper'
import { Id } from '@/domain/value-objects/id'
import { Email } from '@/domain/value-objects/email'
import { Cpf } from '@/domain/value-objects/cpf'

const makeFakeUsers = (): UserModel[] => {
  return [{
    id: Id.create('550e8400-e29b-41d4-a716-446655440000'),
    name: 'any_name',
    email: Email.create('any_email@mail.com'),
    rg: 'any_rg',
    cpf: Cpf.create('529.982.247-25'),
    dataNascimento: 'any_date'
  }, {
    id: Id.create('550e8400-e29b-41d4-a716-446655440001'),
    name: 'other_name',
    email: Email.create('other_email@mail.com'),
    rg: 'other_rg',
    cpf: Cpf.create('71428793860'),
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
    expect(httpResponse.statusCode).toBe(200)
    expect(httpResponse.body).toEqual([
      {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'any_name',
        email: 'any_email@mail.com',
        rg: 'any_rg',
        cpf: '52998224725',
        dataNascimento: 'any_date'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'other_name',
        email: 'other_email@mail.com',
        rg: 'other_rg',
        cpf: '71428793860',
        dataNascimento: 'other_date'
      }
    ])
  })

  test('Should return 500 if LoadUsers throws', async () => {
    const { sut, loadUsersStub } = makeSut()
    jest.spyOn(loadUsersStub, 'load').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
    const httpResponse = await sut.handle({})
    expect(httpResponse).toEqual(serverError(new Error()))
  })
})
