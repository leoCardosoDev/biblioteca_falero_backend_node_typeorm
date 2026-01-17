import { RefreshTokenController } from '@/modules/identity/presentation/controllers/refresh-token-controller'
import { RefreshToken, RefreshTokenParams, RefreshTokenResult } from '@/modules/identity/application/usecases/refresh-token'
import { Validation } from '@/shared/presentation/protocols/validation'
import { HttpRequest } from '@/shared/presentation/protocols/http'
import { MissingParamError } from '@/shared/presentation/errors/missing-param-error'
import { ServerError } from '@/shared/presentation/errors/server-error'
import { UnauthorizedError } from '@/shared/presentation/errors/unauthorized-error'

const makeRefreshToken = (): RefreshToken => {
  class RefreshTokenStub implements RefreshToken {
    async refresh(_params: RefreshTokenParams): Promise<RefreshTokenResult | null> {
      return Promise.resolve({
        accessToken: 'new_access_token',
        refreshToken: 'new_refresh_token',
        name: 'any_name',
        role: 'ADMIN'
      })
    }
  }
  return new RefreshTokenStub()
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
    refreshToken: 'any_refresh_token'
  },
  headers: {
    'x-forwarded-for': '127.0.0.1',
    'user-agent': 'any_user_agent'
  }
})

interface SutTypes {
  sut: RefreshTokenController
  refreshTokenStub: RefreshToken
  validationStub: Validation
}

const makeSut = (): SutTypes => {
  const refreshTokenStub = makeRefreshToken()
  const validationStub = makeValidation()
  const sut = new RefreshTokenController(refreshTokenStub, validationStub)
  return {
    sut,
    refreshTokenStub,
    validationStub
  }
}

describe('RefreshToken Controller', () => {
  test('Should call Validation with correct values', async () => {
    const { sut, validationStub } = makeSut()
    const validateSpy = jest.spyOn(validationStub, 'validate')
    const httpRequest = makeFakeRequest()
    await sut.handle(httpRequest)
    expect(validateSpy).toHaveBeenCalledWith(httpRequest.body)
  })

  test('Should return 400 if Validation returns an error', async () => {
    const { sut, validationStub } = makeSut()
    jest.spyOn(validationStub, 'validate').mockReturnValueOnce(new MissingParamError('refreshToken'))
    const httpResponse = await sut.handle(makeFakeRequest()) as { statusCode: number; body: { error: { code: string } } }
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('refreshToken'))
  })

  test('Should call RefreshToken with correct values', async () => {
    const { sut, refreshTokenStub } = makeSut()
    const refreshSpy = jest.spyOn(refreshTokenStub, 'refresh')
    await sut.handle(makeFakeRequest())
    expect(refreshSpy).toHaveBeenCalledWith({
      refreshToken: 'any_refresh_token',
      ipAddress: '127.0.0.1',
      userAgent: 'any_user_agent'
    })
  })

  test('Should return 401 if RefreshToken returns null', async () => {
    const { sut, refreshTokenStub } = makeSut()
    jest.spyOn(refreshTokenStub, 'refresh').mockResolvedValueOnce(null)
    const httpResponse = await sut.handle(makeFakeRequest()) as { statusCode: number; body: { error: { code: string } } }
    expect(httpResponse.statusCode).toBe(401)
    expect(httpResponse.body).toEqual(new UnauthorizedError())
  })

  test('Should return 200 with new tokens on success', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.handle(makeFakeRequest()) as { statusCode: number; body: RefreshTokenResult }
    expect(httpResponse.statusCode).toBe(200)
    expect(httpResponse.body).toEqual({
      accessToken: 'new_access_token',
      refreshToken: 'new_refresh_token',
      name: 'any_name',
      role: 'ADMIN'
    })
  })

  test('Should return 500 if RefreshToken throws', async () => {
    const { sut, refreshTokenStub } = makeSut()
    jest.spyOn(refreshTokenStub, 'refresh').mockRejectedValueOnce(new Error())
    const httpResponse = await sut.handle(makeFakeRequest()) as { statusCode: number; body: { error: { code: string } } }
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toBeInstanceOf(ServerError)
  })

  test('Should return 500 if Validation throws', async () => {
    const { sut, validationStub } = makeSut()
    jest.spyOn(validationStub, 'validate').mockImplementationOnce(() => {
      throw new Error()
    })
    const httpResponse = await sut.handle(makeFakeRequest()) as { statusCode: number; body: { error: { code: string } } }
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toBeInstanceOf(ServerError)
  })

  test('Should use ip from request if x-forwarded-for header is not present', async () => {
    const { sut, refreshTokenStub } = makeSut()
    const refreshSpy = jest.spyOn(refreshTokenStub, 'refresh')
    const httpRequest: HttpRequest = {
      body: { refreshToken: 'any_refresh_token' },
      headers: { 'user-agent': 'any_user_agent' },
      ip: '192.168.1.1'
    }
    await sut.handle(httpRequest)
    expect(refreshSpy).toHaveBeenCalledWith({
      refreshToken: 'any_refresh_token',
      ipAddress: '192.168.1.1',
      userAgent: 'any_user_agent'
    })
  })
})
