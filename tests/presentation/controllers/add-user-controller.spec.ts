import { AddUserController } from '@/presentation/controllers/add-user-controller'
import { AddUser, AddUserParams } from '@/domain/usecases/add-user'
import { UserModel } from '@/domain/models/user'
import { Validation } from '@/presentation/protocols/validation'
import { HttpRequest } from '@/presentation/protocols'
import { ok } from '@/presentation/helpers/http-helper'
import { UserAlreadyExistsError } from '@/presentation/errors/user-already-exists-error'
import { Id } from '@/domain/value-objects/id'
import { Name, Email, Rg, Cpf, Address } from '@/domain/value-objects'

type ErrorBody = {
  error: {
    code: string
    message: string
    timestamp: string
  }
}

const makeAddUser = (): AddUser => {
  class AddUserStub implements AddUser {
    async add(_user: AddUserParams): Promise<UserModel | Error> {
      return Promise.resolve({
        id: Id.create('11111111-1111-1111-1111-111111111111'),
        name: Name.create('Any Name') as Name,
        email: Email.create('any_email@mail.com') as Email,
        rg: Rg.create('123456789') as Rg,
        cpf: Cpf.create('00000000191') as Cpf,
        gender: 'any_gender',
        phone: '123456789',
        address: Address.create({
          street: 'Any Street',
          number: '123',
          complement: 'Apt 1',
          neighborhoodId: 'any_neighborhood_id',
          cityId: 'any_city_id',
          zipCode: '12345678'
        }) as Address
      })
    }
  }
  return new AddUserStub()
}

const makeValidation = (): Validation => {
  class ValidationStub implements Validation {
    validate(_input: Record<string, unknown>): Error | undefined {
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
    }
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
    jest.spyOn(validationStub, 'validate').mockReturnValueOnce(new Error())
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(expect.objectContaining({
      statusCode: 400,
      body: expect.objectContaining({
        error: expect.objectContaining({
          message: 'Invalid request',
          code: 'BAD_REQUEST',
          timestamp: expect.any(String)
        })
      })
    }))
  })

  test('Should call AddUser with correct values', async () => {
    const { sut, addUserStub } = makeSut()
    const addSpy = jest.spyOn(addUserStub, 'add')
    await sut.handle(makeFakeRequest())
    expect(addSpy).toHaveBeenCalledWith({
      name: Name.create('Any Name') as Name,
      email: Email.create('any_email@mail.com'),
      cpf: Cpf.create('00000000191'),
      rg: Rg.create('123456789') as Rg,
      gender: 'any_gender',
      phone: '123456789',
      address: Address.create({
        street: 'Any Street',
        number: '123',
        complement: 'Apt 1',
        neighborhoodId: 'any_neighborhood_id',
        cityId: 'any_city_id',
        zipCode: '12345678'
      }) as Address
    })
  })

  test('Should return 403 if AddUser returns UserAlreadyExistsError', async () => {
    const { sut, addUserStub } = makeSut()
    jest.spyOn(addUserStub, 'add').mockReturnValueOnce(Promise.resolve(new UserAlreadyExistsError()))
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(expect.objectContaining({
      statusCode: 403,
      body: expect.objectContaining({
        error: expect.objectContaining({
          code: 'FORBIDDEN',
          message: 'Access denied',
          timestamp: expect.any(String)
        })
      })
    }))
  })

  test('Should return 500 if AddUser throws', async () => {
    const { sut, addUserStub } = makeSut()
    jest.spyOn(addUserStub, 'add').mockImplementationOnce(() => { throw new Error() })
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse.statusCode).toBe(500)
    expect((httpResponse.body as ErrorBody).error.code).toBe('INTERNAL_ERROR')
  })

  test('Should return 200 on success', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(ok({
      id: '11111111-1111-1111-1111-111111111111',
      name: 'Any Name',
      email: 'any_email@mail.com',
      rg: '123456789',
      cpf: '00000000191',
      gender: 'any_gender',
      phone: '123456789',
      address: {
        street: 'Any Street',
        number: '123',
        complement: 'Apt 1',
        neighborhoodId: 'any_neighborhood_id',
        cityId: 'any_city_id',
        zipCode: '12345678'
      }
    }))
  })

  test('Should return 400 if Email.create throws', async () => {
    const { sut } = makeSut()
    const httpRequest = makeFakeRequest()
    const body = httpRequest.body as Record<string, unknown>
    body.email = 'invalid-email'
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect((httpResponse.body as ErrorBody).error.code).toBe('INVALID_PARAM')
  })

  test('Should return 400 if Cpf.create throws', async () => {
    const { sut } = makeSut()
    const httpRequest = makeFakeRequest()
    const body = httpRequest.body as Record<string, unknown>
    body.cpf = 'invalid-cpf'
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect((httpResponse.body as ErrorBody).error.code).toBe('INVALID_PARAM')
  })

  test('Should return 400 if Name.create returns an error', async () => {
    const { sut } = makeSut()
    const httpRequest = makeFakeRequest()
    const body = httpRequest.body as Record<string, unknown>
    body.name = 'A' // Invalid name (too short)
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect((httpResponse.body as ErrorBody).error.code).toBe('INVALID_PARAM')
  })

  test('Should return 400 if Rg.create returns an error', async () => {
    const { sut } = makeSut()
    const httpRequest = makeFakeRequest()
    const body = httpRequest.body as Record<string, unknown>
    body.rg = '' // Invalid RG
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect((httpResponse.body as ErrorBody).error.code).toBe('INVALID_PARAM')
  })

  test('Should return 400 if Address.create returns an error', async () => {
    const { sut } = makeSut()
    const httpRequest = makeFakeRequest()
    const body = httpRequest.body as Record<string, unknown>
    body.address = {
      street: '', // Invalid address
      number: '123',
      neighborhoodId: 'any',
      cityId: 'any',
      zipCode: '12345'
    }
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect((httpResponse.body as ErrorBody).error.code).toBe('INVALID_PARAM')
  })
})
