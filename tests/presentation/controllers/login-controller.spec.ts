import { LoginController } from '@/presentation/controllers/login/login-controller'
import { Authentication, AuthenticationParams, AuthenticationModel } from '@/domain/usecases/authentication'
import { Validation } from '@/presentation/protocols/validation'
import { HttpRequest } from '@/presentation/protocols/http'
import { MissingParamError } from '@/presentation/errors'

const makeAuthentication = (): Authentication => {
  class AuthenticationStub implements Authentication {
    async auth(_params: AuthenticationParams): Promise<AuthenticationModel | undefined> {
      return Promise.resolve({
        accessToken: 'any_token',
        name: 'any_name',
        role: 'any_role'
      })
    }
  }
  return new AuthenticationStub()
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
    email: 'any_email@mail.com',
    password: 'any_password'
  }
})

interface SutTypes {
  sut: LoginController
  authenticationStub: Authentication
  validationStub: Validation
}

const makeSut = (): SutTypes => {
  const authenticationStub = makeAuthentication()
  const validationStub = makeValidation()
  const sut = new LoginController(authenticationStub, validationStub)
  return {
    sut,
    authenticationStub,
    validationStub
  }
}

describe('Login Controller', () => {
  test('Should call Validation with correct values', async () => {
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
    expect(httpResponse.body.error.code).toBe('MISSING_PARAM')
  })

  test('Should call Authentication with correct values', async () => {
    const { sut, authenticationStub } = makeSut()
    const authSpy = jest.spyOn(authenticationStub, 'auth')
    await sut.handle(makeFakeRequest())
    expect(authSpy).toHaveBeenCalledWith({
      email: 'any_email@mail.com',
      password: 'any_password'
    })
  })

  test('Should return 401 if Authentication returns undefined', async () => {
    const { sut, authenticationStub } = makeSut()
    jest.spyOn(authenticationStub, 'auth').mockResolvedValueOnce(undefined)
    const httpResponse = await sut.handle(makeFakeRequest()) as { statusCode: number; body: { error: { code: string } } }
    expect(httpResponse.statusCode).toBe(401)
    expect(httpResponse.body.error.code).toBe('UNAUTHORIZED')
  })

  test('Should return 200 with accessToken and name on success', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.handle(makeFakeRequest()) as { statusCode: number; body: { accessToken: string; name: string; role: string } }
    expect(httpResponse.statusCode).toBe(200)
    expect(httpResponse.body).toEqual({
      accessToken: 'any_token',
      name: 'any_name',
      role: 'any_role'
    })
  })

  test('Should return 500 if Authentication throws', async () => {
    const { sut, authenticationStub } = makeSut()
    jest.spyOn(authenticationStub, 'auth').mockRejectedValueOnce(new Error())
    const httpResponse = await sut.handle(makeFakeRequest()) as { statusCode: number; body: { error: { code: string } } }
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body.error.code).toBe('INTERNAL_ERROR')
  })

  test('Should return 500 if Validation throws', async () => {
    const { sut, validationStub } = makeSut()
    jest.spyOn(validationStub, 'validate').mockImplementationOnce(() => {
      throw new Error()
    })
    const httpResponse = await sut.handle(makeFakeRequest()) as { statusCode: number; body: { error: { code: string } } }
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body.error.code).toBe('INTERNAL_ERROR')
  })
})
