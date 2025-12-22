import { CreateUserLoginController } from '@/presentation/controllers/create-user-login-controller'
import { MissingParamError } from '@/presentation/errors'
import { badRequest, serverError, ok } from '@/presentation/helpers'
import { Validation } from '@/presentation/protocols'
import { CreateUserLogin, CreateUserLoginParams } from '@/domain/usecases/create-user-login'
import { LoginModel } from '@/domain/models/login'
import { HttpRequest } from '@/presentation/protocols'

const makeCreateUserLogin = (): CreateUserLogin => {
  class CreateUserLoginStub implements CreateUserLogin {
    async create(_params: CreateUserLoginParams): Promise<LoginModel> {
      return Promise.resolve({
        id: 'valid_id',
        userId: 'valid_user_id',
        password: 'valid_password',
        role: 'valid_role',
        accessToken: 'valid_token'
      })
    }
  }
  return new CreateUserLoginStub()
}

const makeValidation = (): Validation => {
  class ValidationStub implements Validation {
    validate(_input: unknown): Error | null {
      return null
    }
  }
  return new ValidationStub()
}

const makeFakeRequest = (): HttpRequest => ({
  body: {
    userId: 'any_user_id',
    password: 'any_password'
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
      userId: 'any_user_id',
      password: 'any_password'
    })
  })

  test('Should return 500 if CreateUserLogin throws', async () => {
    const { sut, createUserLoginStub } = makeSut()
    jest.spyOn(createUserLoginStub, 'create').mockImplementationOnce(async () => {
      return Promise.reject(new Error())
    })
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(serverError(new Error()))
  })

  test('Should return 200 if valid data is provided', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(ok({
      id: 'valid_id',
      userId: 'valid_user_id',
      password: 'valid_password',
      role: 'valid_role',
      accessToken: 'valid_token'
    }))
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
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(badRequest(new MissingParamError('any_field')))
  })
})
