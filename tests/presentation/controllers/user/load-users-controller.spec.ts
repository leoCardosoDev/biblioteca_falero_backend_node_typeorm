import { LoadUsersController } from '@/presentation/controllers/user/load-users-controller'
import { LoadUsers, UserWithLogin } from '@/domain/usecases/load-users'
import { serverError } from '@/presentation/helpers/http-helper'
import { Id } from '@/domain/value-objects/id'
import { Email } from '@/domain/value-objects/email'
import { Cpf } from '@/domain/value-objects/cpf'
import { Name } from '@/domain/value-objects/name'
import { Rg } from '@/domain/value-objects/rg'
import { Address } from '@/domain/value-objects/address'
import { UserRole } from '@/domain/value-objects/user-role'
import { UserStatus } from '@/domain/value-objects/user-status'

const makeFakeUsers = (): UserWithLogin[] => {
  return [{
    id: Id.create('550e8400-e29b-41d4-a716-446655440000'),
    name: Name.create('any_name') as Name,
    email: Email.create('any_email@mail.com'),
    rg: Rg.create('123456789') as Rg,
    cpf: Cpf.create('529.982.247-25'),
    gender: 'male',
    status: UserStatus.create('ACTIVE') as UserStatus,
    version: 1
  }, {
    id: Id.create('550e8400-e29b-41d4-a716-446655440001'),
    name: Name.create('other_name') as Name,
    email: Email.create('other_email@mail.com'),
    rg: Rg.create('987654321') as Rg,
    cpf: Cpf.create('71428793860'),
    gender: 'female',
    status: UserStatus.create('ACTIVE') as UserStatus,
    version: 1
  }]
}

const makeLoadUsers = (): LoadUsers => {
  class LoadUsersStub implements LoadUsers {
    async load(): Promise<UserWithLogin[]> {
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
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date('2025-12-25'))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

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
        gender: 'male',
        phone: undefined,
        status: 'ACTIVE',
        version: 1,
        login: null
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'other_name',
        email: 'other_email@mail.com',
        rg: '987654321',
        cpf: '71428793860',
        gender: 'female',
        phone: undefined,
        status: 'ACTIVE',
        version: 1,
        login: null
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
    const userWithAddress: UserWithLogin = {
      id: Id.create('550e8400-e29b-41d4-a716-446655440002'),
      name: Name.create('user_with_address') as Name,
      email: Email.create('address@mail.com'),
      rg: Rg.create('999888777') as Rg,
      cpf: Cpf.create('529.982.247-25'),
      gender: 'male',
      status: UserStatus.create('ACTIVE') as UserStatus,
      version: 1,
      address: Address.create({
        street: 'any_street',
        number: '123',
        neighborhoodId: 'any_neighborhood',
        cityId: 'any_city',
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
      neighborhoodId: 'any_neighborhood',
      cityId: 'any_city',
      zipCode: '12345678'
    })
  })

  test('Should serialize user login when present', async () => {
    const { sut, loadUsersStub } = makeSut()
    const userWithLogin: UserWithLogin = {
      ...makeFakeUsers()[0],
      login: {
        role: UserRole.create('ADMIN') as UserRole,
        status: UserStatus.create('ACTIVE') as UserStatus
      }
    }
    jest.spyOn(loadUsersStub, 'load').mockResolvedValueOnce([userWithLogin])
    const httpResponse = await sut.handle({})
    expect(httpResponse.statusCode).toBe(200)
    expect((httpResponse.body as Array<{ login: unknown }>)[0].login).toEqual({
      role: 'ADMIN',
      status: 'ACTIVE'
    })
  })
})
