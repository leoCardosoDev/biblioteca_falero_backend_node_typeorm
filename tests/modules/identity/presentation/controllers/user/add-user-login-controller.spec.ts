import { AddUserLoginController } from '@/modules/identity/presentation/controllers/add-user-login-controller'
import { HttpRequest } from '@/shared/presentation/protocols/http'
import { AddUserLogin, AddUserLoginParams } from '@/modules/identity/application/usecases/add-user-login'
import { LoginModel } from '@/modules/identity/domain/models/login'
import { Validation } from '@/shared/presentation/protocols/validation'
import { ok } from '@/shared/presentation/helpers/http-helper'
import { Id } from '@/shared/domain/value-objects/id'
import { Password } from '@/modules/identity/domain/value-objects/password'
import { UserRole } from '@/modules/identity/domain/value-objects/user-role'
import { UserStatus } from '@/modules/identity/domain/value-objects/user-status'
import { Email } from '@/modules/identity/domain/value-objects/email'

import { ServerError } from '@/shared/presentation/errors/server-error'

const makeFakeRequest = (): HttpRequest => ({
  userId: '550e8400-e29b-41d4-a716-446655440099', // Valid UUID
  params: { userId: '550e8400-e29b-41d4-a716-446655440000' },
  body: {
    email: 'any_email@mail.com',
    password: 'Any_password1!',
    role: 'ADMIN',
    status: 'ACTIVE'
  }
})

const makeFakeLogin = (): LoginModel => ({
  id: Id.create('550e8400-e29b-41d4-a716-446655440000') as Id,
  userId: Id.create('550e8400-e29b-41d4-a716-446655440001') as Id,
  email: Email.create('any_email@mail.com') as Email,
  passwordHash: 'any_hash',
  roleId: Id.create('550e8400-e29b-41d4-a716-446655440002') as Id,
  isActive: true
})

const makeAddUserLogin = (): AddUserLogin => {
  class AddUserLoginStub implements AddUserLogin {
    async add(_data: AddUserLoginParams): Promise<LoginModel> {
      return Promise.resolve(makeFakeLogin())
    }
  }
  return new AddUserLoginStub()
}

const makeValidation = (): Validation => {
  class ValidationStub implements Validation {
    validate(_input: unknown): Error | undefined {
      return undefined
    }
  }
  return new ValidationStub()
}

type SutTypes = {
  sut: AddUserLoginController
  addUserLoginStub: AddUserLogin
  validationStub: Validation
}

const makeSut = (): SutTypes => {
  const addUserLoginStub = makeAddUserLogin()
  const validationStub = makeValidation()
  const sut = new AddUserLoginController(addUserLoginStub, validationStub)
  return {
    sut,
    addUserLoginStub,
    validationStub
  }
}

describe('AddUserLogin Controller', () => {
  beforeAll(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2025-12-31T15:00:00Z'))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  test('Should call Validation with correct values', async () => {
    const { sut, validationStub } = makeSut()
    const validateSpy = jest.spyOn(validationStub, 'validate')
    const httpRequest = makeFakeRequest()
    await sut.handle(httpRequest)
    const body = httpRequest.body as Record<string, unknown>
    const params = httpRequest.params as { userId: string }
    expect(validateSpy).toHaveBeenCalledWith({ ...body, userId: params.userId })
  })

  test('Should return 400 if Validation returns an error', async () => {
    const { sut, validationStub } = makeSut()
    jest.spyOn(validationStub, 'validate').mockReturnValueOnce(new Error('any_error'))
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new Error('any_error'))
  })

  test('Should return 400 if invalid Id is provided', async () => {
    const { sut } = makeSut()
    const httpRequest = makeFakeRequest()
      ; (httpRequest.params as { userId: string }).userId = 'invalid_id'
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    // DomainError message "Invalid ID format"
    expect(httpResponse.body).toEqual(new Error('Invalid ID format'))
  })

  test('Should return 400 if invalid role is provided', async () => {
    const { sut } = makeSut()
    const httpRequest = makeFakeRequest()
    const body = httpRequest.body as Record<string, unknown>
    httpRequest.body = { ...body, password: 'Any_password1!' }
      ; (httpRequest.body as { role: string }).role = 'invalid_role'
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new Error('Invalid User Role'))
  })

  test('Should return 400 if invalid status is provided', async () => {
    const { sut } = makeSut()
    const httpRequest = makeFakeRequest()
    const body = httpRequest.body as Record<string, unknown>
    httpRequest.body = { ...body, password: 'Any_password1!' }
      ; (httpRequest.body as { status: string }).status = 'invalid_status'
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new Error('Invalid User Status'))
  })

  test('Should return 400 if invalid email is provided', async () => {
    const { sut } = makeSut()
    const httpRequest = makeFakeRequest()
    const body = httpRequest.body as Record<string, unknown>
    httpRequest.body = { ...body, password: 'Any_password1!' }
      ; (httpRequest.body as { email: string }).email = 'invalid_email'
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new Error('Invalid email format'))
  })

  test('Should call AddUserLogin with correct values', async () => {
    const { sut, addUserLoginStub } = makeSut()
    const addSpy = jest.spyOn(addUserLoginStub, 'add')
    await sut.handle(makeFakeRequest())
    expect(addSpy).toHaveBeenCalledWith({
      actorId: expect.any(Id),
      userId: expect.any(Id),
      email: expect.any(Email),
      password: expect.any(Password),
      role: expect.any(UserRole),
      status: expect.any(UserStatus)
    })
  })

  test('Should return 500 if NO User ID (actor) is found in request', async () => {
    const { sut } = makeSut()
    const request = makeFakeRequest()
    delete request.userId
    const httpResponse = await sut.handle(request)
    expect(httpResponse.statusCode).toBe(403)
    expect(httpResponse.body).toEqual(new Error('Missing actor'))
  })

  test('Should return 500 if AddUserLogin throws', async () => {
    const { sut, addUserLoginStub } = makeSut()
    jest.spyOn(addUserLoginStub, 'add').mockImplementationOnce(async () => {
      return Promise.reject(new Error())
    })
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toBeInstanceOf(ServerError)
  })

  test('Should return 200 if valid data is provided', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(ok({
      id: '550e8400-e29b-41d4-a716-446655440000',
      userId: '550e8400-e29b-41d4-a716-446655440001',
      roleId: '550e8400-e29b-41d4-a716-446655440002',
      email: 'any_email@mail.com',
      status: 'ACTIVE'
    }))
  })

  test('Should return 200 with status INACTIVE if login is inactive', async () => {
    const { sut, addUserLoginStub } = makeSut()
    jest.spyOn(addUserLoginStub, 'add').mockResolvedValueOnce({
      ...makeFakeLogin(),
      isActive: false
    })
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(ok({
      id: '550e8400-e29b-41d4-a716-446655440000',
      userId: '550e8400-e29b-41d4-a716-446655440001',
      roleId: '550e8400-e29b-41d4-a716-446655440002',
      email: 'any_email@mail.com',
      status: 'INACTIVE'
    }))
  })
})
