import { AddUserController } from '@/modules/identity/presentation/controllers/add-user-controller'
import { AddUser, AddUserParams } from '@/modules/identity/application/usecases/add-user'
import { AddUserOutput } from '@/modules/identity/application/usecases/add-user-output'
import { Validation } from '@/shared/presentation/protocols/validation'
import { HttpRequest } from '@/shared/presentation/protocols/http'
import { ok } from '@/shared/presentation/helpers/http-helper'
import { ServerError } from '@/shared/presentation/errors/server-error'
import { InvalidAddressError } from '@/shared/domain/errors/invalid-address-error'
import { InvalidNameError } from '@/modules/identity/domain/errors/invalid-name-error'
import { InvalidEmailError } from '@/modules/identity/domain/errors/invalid-email-error'
import { InvalidRgError } from '@/modules/identity/domain/errors/invalid-rg-error'
import { InvalidCpfError } from '@/modules/identity/domain/errors/invalid-cpf-error'

const makeAddUser = (): AddUser => {
  class AddUserStub implements AddUser {
    async add(_user: AddUserParams): Promise<AddUserOutput | Error> {
      return Promise.resolve({
        id: '11111111-1111-1111-1111-111111111111',
        name: 'Any Name',
        email: 'any_email@mail.com',
        cpf: '00000000191',
        role: 'USER',
        status: 'ACTIVE'
      })
    }
  }
  return new AddUserStub()
}

const makeValidation = (): Validation => {
  class ValidationStub implements Validation {
    validate(_input: unknown): Error | undefined {
      return undefined
    }
  }
  return new ValidationStub()
}

interface SutTypes {
  sut: AddUserController
  addUserStub: AddUser
  validationStub: Validation
}

const makeSut = (): SutTypes => {
  const addUserStub = makeAddUser()
  const validationStub = makeValidation()
  const sut = new AddUserController(validationStub, addUserStub)
  return {
    sut,
    addUserStub,
    validationStub
  }
}

const makeFakeRequest = (): HttpRequest => ({
  body: {
    name: 'Any Name',
    email: 'any_email@mail.com',
    cpf: '00000000191',
    rg: '123456789',
    gender: 'any_gender',
    phone: '123456789',
    address: {
      street: 'Any Street',
      number: '123',
      complement: 'Apt 1',
      neighborhoodId: 'any_neighborhood_id',
      cityId: 'any_city_id',
      zipCode: '12345678'
    },
    status: 'ACTIVE'
  }
})

describe('AddUser Controller', () => {
  test('Should call Validation with correct values', async () => {
    const { sut, validationStub } = makeSut()
    const validateSpy = jest.spyOn(validationStub, 'validate')
    const httpRequest = makeFakeRequest()
    await sut.handle(httpRequest)
    expect(validateSpy).toHaveBeenCalledWith(httpRequest.body)
  })

  test('Should return 400 if Validation returns an error', async () => {
    const { sut, validationStub } = makeSut()
    jest.spyOn(validationStub, 'validate').mockReturnValueOnce(new Error('any_error'))
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new Error('any_error'))
  })

  test('Should call AddUser with correct values', async () => {
    const { sut, addUserStub } = makeSut()
    const addSpy = jest.spyOn(addUserStub, 'add')
    await sut.handle(makeFakeRequest())
    expect(addSpy).toHaveBeenCalledWith({
      name: expect.objectContaining({ value: 'Any Name' }),
      email: expect.objectContaining({ value: 'any_email@mail.com' }),
      cpf: expect.objectContaining({ value: '00000000191' }),
      rg: expect.objectContaining({ value: '123456789' }),
      gender: 'any_gender',
      phone: '123456789',
      password: undefined,
      status: expect.objectContaining({ value: 'ACTIVE' }),
      address: {
        street: 'Any Street',
        number: '123',
        complement: 'Apt 1',
        neighborhoodId: 'any_neighborhood_id',
        cityId: 'any_city_id',
        zipCode: '12345678'
      }
    })
  })

  // Test removed: UserAlreadyExistsError is no longer used by AddUserController
  // Controller now returns badRequest for all errors from AddUser

  test('Should return 500 if AddUser throws', async () => {
    const { sut, addUserStub } = makeSut()
    jest.spyOn(addUserStub, 'add').mockImplementationOnce(() => { throw new Error() })
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toBeInstanceOf(ServerError)
  })

  test('Should return 500 if AddUser throws a non-Error object', async () => {
    const { sut, addUserStub } = makeSut()
    jest.spyOn(addUserStub, 'add').mockImplementationOnce(() => { throw 'some_string_error' })
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toBeInstanceOf(ServerError)
  })

  test('Should return 200 on success', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(ok({
      id: '11111111-1111-1111-1111-111111111111',
      name: 'Any Name',
      email: 'any_email@mail.com',
      cpf: '00000000191',
      role: 'USER',
      status: 'ACTIVE'
    }))
  })

  test('Should return 400 if AddUser returns InvalidEmailError', async () => {
    const { sut, addUserStub } = makeSut()
    jest.spyOn(addUserStub, 'add').mockResolvedValueOnce(new InvalidEmailError())
    const httpRequest = makeFakeRequest()
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new InvalidEmailError())
  })

  test('Should return 400 if AddUser returns InvalidCpfError', async () => {
    const { sut, addUserStub } = makeSut()
    jest.spyOn(addUserStub, 'add').mockResolvedValueOnce(new InvalidCpfError())
    const httpRequest = makeFakeRequest()
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new InvalidCpfError())
  })

  test('Should return 400 if AddUser returns InvalidNameError', async () => {
    const { sut, addUserStub } = makeSut()
    jest.spyOn(addUserStub, 'add').mockResolvedValueOnce(new InvalidNameError('a'))
    const httpRequest = makeFakeRequest()
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new InvalidNameError('a'))
  })

  test('Should return 400 if AddUser returns InvalidRgError', async () => {
    const { sut, addUserStub } = makeSut()
    jest.spyOn(addUserStub, 'add').mockResolvedValueOnce(new InvalidRgError('invalid_rg'))
    const httpRequest = makeFakeRequest()
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new InvalidRgError('invalid_rg'))
  })

  test('Should return 400 if AddUser returns InvalidAddressError', async () => {
    const { sut, addUserStub } = makeSut()
    const httpRequest = makeFakeRequest()
    jest.spyOn(addUserStub, 'add').mockResolvedValueOnce(new InvalidAddressError('any_error'))
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new InvalidAddressError('any_error'))
  })
})
