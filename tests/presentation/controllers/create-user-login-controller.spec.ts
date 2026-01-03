import { CreateUserLoginController } from '@/presentation/controllers'
import { CreateUserLogin, CreateUserLoginParams } from '@/domain/usecases'
import { Validation } from '@/presentation/protocols/validation'
import { MissingParamError, InvalidParamError, ServerError } from '@/presentation/errors'
import { Login, LoginModel } from '@/domain/models'
import { HttpRequest } from '@/presentation/protocols'
import { Id, UserRole, UserStatus, Email } from '@/domain/value-objects'

const makeCreateUserLogin = (): CreateUserLogin => {
  class CreateUserLoginStub implements CreateUserLogin {
    async create(_params: CreateUserLoginParams): Promise<LoginModel> {
      return Promise.resolve(Login.create({
        id: Id.create('550e8400-e29b-41d4-a716-446655440000'),
        userId: Id.create('550e8400-e29b-41d4-a716-446655440001'),
        roleId: Id.create('550e8400-e29b-41d4-a716-446655440002'),
        email: Email.create('any_email@mail.com') as Email,
        passwordHash: 'hashed_password',
        isActive: true
      }))
    }
  }
  return new CreateUserLoginStub()
}

const makeValidation = (): Validation => {
  class ValidationStub implements Validation {
    validate(_input: Record<string, unknown>): Error | undefined {
      return undefined
    }
  }
  return new ValidationStub()
}

const makeFakeRequest = (): HttpRequest => ({
  body: {
    userId: '550e8400-e29b-41d4-a716-446655440001',
    password: 'Abcdefg1!'
  }
})

interface SutTypes {
  sut: CreateUserLoginController
  createUserLoginStub: CreateUserLogin
  validationStub: Validation
}

const makeSut = (): SutTypes => {
  const createUserLoginStub = makeCreateUserLogin()
  const validationStub = makeValidation()
  const sut = new CreateUserLoginController(validationStub, createUserLoginStub)
  return {
    sut,
    createUserLoginStub,
    validationStub
  }
}

describe('CreateUserLogin Controller', () => {
  test('Should call CreateUserLogin with correct values', async () => {
    const { sut, createUserLoginStub } = makeSut()
    const createSpy = jest.spyOn(createUserLoginStub, 'create')
    await sut.handle(makeFakeRequest())
    expect(createSpy).toHaveBeenCalledWith({
      userId: Id.create('550e8400-e29b-41d4-a716-446655440001'),
      password: 'Abcdefg1!',
      role: undefined,
      status: undefined
    })
  })

  test('Should call CreateUserLogin with provided role and status', async () => {
    const { sut, createUserLoginStub } = makeSut()
    const createSpy = jest.spyOn(createUserLoginStub, 'create')
    const httpRequest = {
      body: {
        userId: '550e8400-e29b-41d4-a716-446655440001',
        password: 'Abcdefg1!',
        role: 'ADMIN',
        status: 'INACTIVE'
      }
    }
    await sut.handle(httpRequest)
    expect(createSpy).toHaveBeenCalledWith({
      userId: Id.create('550e8400-e29b-41d4-a716-446655440001'),
      password: 'Abcdefg1!',
      role: UserRole.create('ADMIN'),
      status: UserStatus.create('INACTIVE')
    })
  })

  test('Should return 500 if CreateUserLogin throws', async () => {
    const { sut, createUserLoginStub } = makeSut()
    jest.spyOn(createUserLoginStub, 'create').mockImplementationOnce(async () => {
      return Promise.reject(new Error())
    })
    const httpResponse = await sut.handle(makeFakeRequest()) as { statusCode: number; body: { error: { code: string } } }
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toBeInstanceOf(ServerError)
  })

  test('Should return 200 if valid data is provided', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.handle(makeFakeRequest()) as { statusCode: number; body: unknown }
    expect(httpResponse.statusCode).toBe(200)
    expect(httpResponse.body).toEqual({
      id: '550e8400-e29b-41d4-a716-446655440000',
      userId: '550e8400-e29b-41d4-a716-446655440001',
      email: 'any_email@mail.com'
    })
  })

  test('Should call Validation with correct value', async () => {
    const { sut, validationStub } = makeSut()
    const validateSpy = jest.spyOn(validationStub, 'validate')
    const httpRequest = makeFakeRequest()
    await sut.handle(httpRequest)
    expect(validateSpy).toHaveBeenCalledWith(httpRequest.body)
  })

  test('Should return 400 if Validation returns an error', async () => {
    const { sut, validationStub } = makeSut()
    jest.spyOn(validationStub, 'validate').mockReturnValueOnce(new MissingParamError('any_field'))
    const httpResponse = await sut.handle(makeFakeRequest()) as { statusCode: number; body: { error: { code: string } } }
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('any_field'))
  })

  test('Should return 400 if password does not meet policy requirements', async () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        userId: '550e8400-e29b-41d4-a716-446655440001',
        password: 'weak'
      }
    }
    const httpResponse = await sut.handle(httpRequest) as { statusCode: number; body: { error: { message: string } } }
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new InvalidParamError('password'))
  })

  test('Should return 400 if an invalid role is provided (Line 44)', async () => {
    const { sut, createUserLoginStub } = makeSut()
    jest.spyOn(createUserLoginStub, 'create')
    const httpResponse = await sut.handle({
      body: {
        userId: '550e8400-e29b-41d4-a716-446655440001', // Valid UUID
        password: 'Abcdefg1!', // Valid Password to pass first check
        role: 'INVALID_ROLE' // Role that doesn't exist
      }
    })
    expect(httpResponse.statusCode).toBe(400)
    const body = httpResponse.body as Error
    expect(body).toBeInstanceOf(Error)
    expect(body.name).toBe('InvalidParamError')
  })

  test('Should return 400 if an invalid status is provided (Line 53)', async () => {
    const { sut, createUserLoginStub } = makeSut()
    jest.spyOn(createUserLoginStub, 'create')
    const httpResponse = await sut.handle({
      body: {
        userId: '550e8400-e29b-41d4-a716-446655440001', // Valid UUID
        password: 'Abcdefg1!', // Valid Password
        status: 'INVALID_STATUS'
      }
    })
    expect(httpResponse.statusCode).toBe(400)
    const body = httpResponse.body as Error
    expect(body).toBeInstanceOf(Error)
    expect(body.name).toBe('InvalidParamError')
  })

  test('Should return 400 if ID.create throws', async () => {
    const { sut } = makeSut()
    const httpRequest = makeFakeRequest()
    httpRequest.params = { userId: 'invalid-id' }
    const httpResponse = await sut.handle(httpRequest) as { statusCode: number; body: { error: { code: string } } }
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toBeInstanceOf(InvalidParamError)
  })
})
