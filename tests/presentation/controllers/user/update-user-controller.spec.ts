import { UpdateUserController } from '@/presentation/controllers/user/update-user-controller'
import { UpdateUser, UpdateUserParams } from '@/domain/usecases/update-user'
import { UserModel } from '@/domain/models/user'
import { Id } from '@/domain/value-objects/id'
import { Email } from '@/domain/value-objects/email'
import { Cpf } from '@/domain/value-objects/cpf'
import { Name } from '@/domain/value-objects/name'
import { Rg } from '@/domain/value-objects/rg'
// removed BirthDate import
import { Address } from '@/domain/value-objects/address'
import { notFound } from '@/presentation/helpers/http-helper'
import { NotFoundError } from '@/domain/errors'
import { UserStatus } from '@/domain/value-objects/user-status'

const makeFakeUser = (): UserModel => ({
  id: Id.create('550e8400-e29b-41d4-a716-446655440000'),
  name: Name.create('any_name') as Name,
  email: Email.create('any_email@mail.com'),
  rg: Rg.create('123456789') as Rg,
  cpf: Cpf.create('529.982.247-25'),
  gender: 'male',
  status: UserStatus.create('ACTIVE') as UserStatus,
  version: 1
})

const makeUpdateUser = (): UpdateUser => {
  class UpdateUserStub implements UpdateUser {
    async update(_userData: UpdateUserParams): Promise<UserModel> {
      return await new Promise(resolve => resolve(makeFakeUser()))
    }
  }
  return new UpdateUserStub()
}

interface SutTypes {
  sut: UpdateUserController
  updateUserStub: UpdateUser
}

const makeSut = (): SutTypes => {
  const updateUserStub = makeUpdateUser()
  const sut = new UpdateUserController(updateUserStub)
  return {
    sut,
    updateUserStub
  }
}

describe('UpdateUser Controller', () => {
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-01-01'))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  test('Should return 400 if no id is provided', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.handle({
      body: { name: 'any_name' }
    }) as { statusCode: number; body: { error: { code: string } } }
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body.error.code).toBe('MISSING_PARAM')
  })

  test('Should call UpdateUser with correct values', async () => {
    const { sut, updateUserStub } = makeSut()
    const updateSpy = jest.spyOn(updateUserStub, 'update')
    const httpRequest = {
      params: { id: '550e8400-e29b-41d4-a716-446655440000' },
      body: {
        name: 'updated_name',
        email: 'updated_email@mail.com',
        rg: '987654321', // Valid Rg
        cpf: '714.287.938-60', // Valid CPF
        address: { // Valid Address
          street: 'updated_street',
          number: '456',
          neighborhoodId: 'updated_neighborhood',
          cityId: 'updated_city',
          zipCode: '87654321'
        }
      }
    }
    await sut.handle(httpRequest)
    expect(updateSpy).toHaveBeenCalledWith({
      id: Id.create('550e8400-e29b-41d4-a716-446655440000'),
      name: Name.create('updated_name'),
      email: Email.create('updated_email@mail.com'),
      rg: Rg.create('987654321'),
      cpf: Cpf.create('714.287.938-60'),
      address: Address.create({
        street: 'updated_street',
        number: '456',
        neighborhoodId: 'updated_neighborhood',
        cityId: 'updated_city',
        zipCode: '87654321'
      })
    })
  })

  test('Should call UpdateUser with gender and phone', async () => {
    const { sut, updateUserStub } = makeSut()
    const updateSpy = jest.spyOn(updateUserStub, 'update')
    await sut.handle({
      params: { id: '550e8400-e29b-41d4-a716-446655440000' },
      body: { gender: 'female', phone: '11999999999' }
    })
    expect(updateSpy).toHaveBeenCalledWith(expect.objectContaining({
      gender: 'female',
      phone: '11999999999'
    }))
  })

  test('Should return 200 on success', async () => {
    const { sut } = makeSut()
    const httpRequest = {
      params: { id: '550e8400-e29b-41d4-a716-446655440000' },
      body: { name: 'updated_name' }
    }
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(200)
    expect(httpResponse.body).toEqual({
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'any_name',
      email: 'any_email@mail.com',
      rg: '123456789',
      cpf: '52998224725',
      gender: 'male',
      status: 'ACTIVE',
      version: 1
    })
  })

  test('Should return 500 if UpdateUser throws', async () => {
    const { sut, updateUserStub } = makeSut()
    jest.spyOn(updateUserStub, 'update').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
    const httpRequest = {
      params: { id: '550e8400-e29b-41d4-a716-446655440000' },
      body: { name: 'updated_name' }
    }
    const httpResponse = await sut.handle(httpRequest) as { statusCode: number; body: { error: { code: string } } }
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body.error.code).toBe('INTERNAL_ERROR')
  })

  test('Should return 400 if id is invalid', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.handle({
      params: { id: 'invalid-uuid' },
      body: { name: 'updated_name' }
    })
    expect(httpResponse.statusCode).toBe(400)
  })

  test('Should return 400 if name is invalid', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.handle({
      params: { id: '550e8400-e29b-41d4-a716-446655440000' },
      body: { name: 'a' } // Invalid name (too short)
    })
    expect(httpResponse.statusCode).toBe(400)
  })

  test('Should return 404 if UpdateUser returns null', async () => {
    const { sut, updateUserStub } = makeSut()
    jest.spyOn(updateUserStub, 'update').mockResolvedValueOnce(null)
    const httpRequest = {
      params: { id: '550e8400-e29b-41d4-a716-446655440000' },
      body: { name: 'updated_name' }
    }
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse).toEqual(notFound(new NotFoundError('User')))
  })

  test('Should return 400 if email is invalid', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.handle({
      params: { id: '550e8400-e29b-41d4-a716-446655440000' },
      body: { email: 'invalid-email' }
    })
    expect(httpResponse.statusCode).toBe(400)
  })

  test('Should return 400 if cpf is invalid', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.handle({
      params: { id: '550e8400-e29b-41d4-a716-446655440000' },
      body: { cpf: '00000000000' }
    })
    expect(httpResponse.statusCode).toBe(400)
  })

  test('Should return 400 if rg is invalid', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.handle({
      params: { id: '550e8400-e29b-41d4-a716-446655440000' },
      body: { rg: 'invalid!' }
    })
    expect(httpResponse.statusCode).toBe(400)
  })

  // removed test('Should return 400 if birthDate is invalid')

  test('Should return 400 if address is invalid', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.handle({
      params: { id: '550e8400-e29b-41d4-a716-446655440000' },
      body: {
        address: {
          street: '',
          number: '',
          neighborhoodId: '',
          cityId: '',
          zipCode: ''
        }
      }
    })
    expect(httpResponse.statusCode).toBe(400)
  })

  test('Should serialize user address when returned', async () => {
    const { sut, updateUserStub } = makeSut()
    const userWithAddress = {
      ...makeFakeUser(),
      address: Address.create({
        street: 'updated_street',
        number: '456',
        neighborhoodId: 'updated_neighborhood',
        cityId: 'updated_city',
        zipCode: '87654321'
      }) as Address
    }
    jest.spyOn(updateUserStub, 'update').mockResolvedValueOnce(userWithAddress)
    const httpRequest = {
      params: { id: '550e8400-e29b-41d4-a716-446655440000' },
      body: { name: 'any_name' }
    }
    const httpResponse = await sut.handle(httpRequest) as { statusCode: number; body: { address: unknown } }
    expect(httpResponse.statusCode).toBe(200)
    expect(httpResponse.body.address).toEqual({
      street: 'updated_street',
      number: '456',
      complement: undefined,
      neighborhoodId: 'updated_neighborhood',
      cityId: 'updated_city',
      zipCode: '87654321'
    })
  })
})
