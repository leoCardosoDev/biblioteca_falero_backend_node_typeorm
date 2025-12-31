import { AddUserLoginController } from '@/presentation/controllers/user/add-user-login-controller'
import { HttpRequest } from '@/presentation/protocols/http'
import { AddUserLogin, AddUserLoginParams } from '@/domain/usecases/add-user-login'
import { LoginModel } from '@/domain/models/login'
import { Validation } from '@/presentation/protocols/validation'
import { ok } from '@/presentation/helpers/http-helper'
import { Id } from '@/domain/value-objects/id'
import { UserRole } from '@/domain/value-objects/user-role'
import { UserStatus } from '@/domain/value-objects/user-status'

const makeFakeRequest = (): HttpRequest => ({
  params: { id: '550e8400-e29b-41d4-a716-446655440000' },
  body: {
    password: 'any_password',
    role: 'ADMIN',
    status: 'active'
  }
})

const makeFakeLogin = (): LoginModel => ({
  id: Id.create('550e8400-e29b-41d4-a716-446655440000') as Id,
  userId: Id.create('550e8400-e29b-41d4-a716-446655440001') as Id,
  password: 'any_password',
  role: UserRole.create('ADMIN') as UserRole,
  status: UserStatus.create('active') as UserStatus
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
    expect(validateSpy).toHaveBeenCalledWith(httpRequest.body)
  })

  test('Should return 400 if Validation returns an error', async () => {
    const { sut, validationStub } = makeSut()
    jest.spyOn(validationStub, 'validate').mockReturnValueOnce(new Error())
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual({
      error: {
        code: 'BAD_REQUEST',
        message: 'Invalid request',
        details: undefined,
        timestamp: '2025-12-31T15:00:00.000Z'
      }
    })
  })

  test('Should return 400 if invalid Id is provided', async () => {
    const { sut } = makeSut()
    const httpRequest = makeFakeRequest()
      ; (httpRequest.params as { id: string }).id = 'invalid_id'
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual({
      error: {
        code: 'INVALID_PARAM',
        message: 'Invalid ID format',
        details: undefined,
        timestamp: '2025-12-31T15:00:00.000Z'
      }
    })
  })

  test('Should return 400 if invalid role is provided', async () => {
    const { sut } = makeSut()
    const httpRequest = makeFakeRequest()
      ; (httpRequest.body as { role: string }).role = 'invalid_role'
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual({
      error: {
        code: 'INVALID_PARAM',
        message: 'Invalid User Role',
        details: undefined,
        timestamp: '2025-12-31T15:00:00.000Z'
      }
    })
  })

  test('Should return 400 if invalid status is provided', async () => {
    const { sut } = makeSut()
    const httpRequest = makeFakeRequest()
      ; (httpRequest.body as { status: string }).status = 'invalid_status'
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual({
      error: {
        code: 'INVALID_PARAM',
        message: 'Invalid User Status',
        details: undefined,
        timestamp: '2025-12-31T15:00:00.000Z'
      }
    })
  })

  test('Should call AddUserLogin with correct values', async () => {
    const { sut, addUserLoginStub } = makeSut()
    const addSpy = jest.spyOn(addUserLoginStub, 'add')
    await sut.handle(makeFakeRequest())
    expect(addSpy).toHaveBeenCalledWith({
      userId: expect.any(Id),
      password: 'any_password',
      role: expect.any(UserRole),
      status: expect.any(UserStatus)
    })
  })

  test('Should return 500 if AddUserLogin throws', async () => {
    const { sut, addUserLoginStub } = makeSut()
    jest.spyOn(addUserLoginStub, 'add').mockImplementationOnce(async () => {
      return Promise.reject(new Error())
    })
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse.statusCode).toBe(500)
    expect((httpResponse.body as { error: { code: string, message: string, timestamp: string } }).error).toMatchObject({
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
      timestamp: '2025-12-31T15:00:00.000Z'
    })
  })

  test('Should return 200 if valid data is provided', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(ok({
      id: '550e8400-e29b-41d4-a716-446655440000',
      userId: '550e8400-e29b-41d4-a716-446655440001',
      role: 'ADMIN',
      status: 'active'
    }))
  })
})

