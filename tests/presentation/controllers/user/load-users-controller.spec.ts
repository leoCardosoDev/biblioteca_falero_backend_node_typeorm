import { LoadUsersController } from '@/presentation/controllers/user/load-users-controller'
import { LoadUsers } from '@/domain/usecases/load-users'
import { UserModel } from '@/domain/models/user'
import { serverError } from '@/presentation/helpers/http-helper'
import { Id } from '@/domain/value-objects/id'
import { Email } from '@/domain/value-objects/email'
import { Cpf } from '@/domain/value-objects/cpf'
import { Name } from '@/domain/value-objects/name'
import { Rg } from '@/domain/value-objects/rg'
import { BirthDate } from '@/domain/value-objects/birth-date'
import { Address } from '@/domain/value-objects/address'

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
        rg: '123456789',
        cpf: '52998224725',
        birthDate: '1990-01-15'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'other_name',
        email: 'other_email@mail.com',
        rg: '987654321',
        cpf: '71428793860',
        birthDate: '1985-05-20'
      }
    ])
  })

  test('Should return 500 if LoadUsers throws', async () => {
    const { sut, loadUsersStub } = makeSut()
    jest.spyOn(loadUsersStub, 'load').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
    const httpResponse = await sut.handle({})
    expect(httpResponse).toEqual(serverError(new Error()))
  })

  test('Should serialize user address when present', async () => {
    const { sut, loadUsersStub } = makeSut()
    const userWithAddress: UserModel = {
      id: Id.create('550e8400-e29b-41d4-a716-446655440002'),
      name: Name.create('user_with_address') as Name,
      email: Email.create('address@mail.com'),
      rg: Rg.create('999888777') as Rg,
      cpf: Cpf.create('529.982.247-25'),
      birthDate: BirthDate.create('1990-01-15') as BirthDate,
      address: Address.create({
        street: 'any_street',
        number: '123',
        neighborhood: 'any_neighborhood',
        city: 'any_city',
        state: 'SP',
        zipCode: '12345678'
      }) as Address
    }
    jest.spyOn(loadUsersStub, 'load').mockResolvedValueOnce([userWithAddress])
    const httpResponse = await sut.handle({})
    expect(httpResponse.statusCode).toBe(200)
    expect((httpResponse.body as Array<{ address: unknown }>)[0].address).toEqual({
      street: 'any_street',
      number: '123',
      complement: undefined,
      neighborhood: 'any_neighborhood',
      city: 'any_city',
      state: 'SP',
      zipCode: '12345678'
    })
  })
})
