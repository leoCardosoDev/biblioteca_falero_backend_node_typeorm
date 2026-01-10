import { LogoutController } from '@/presentation/controllers/login/logout-controller'
import { Logout } from '@/domain/usecases/logout'
import { Validation } from '@/presentation/protocols/validation'
import { HttpRequest } from '@/presentation/protocols/http'
import { badRequest, serverError, noContent } from '@/presentation/helpers/http-helper'
import { MissingParamError } from '@/presentation/errors'

const mockRequest = (): HttpRequest => ({
  body: {
    refreshToken: 'any_token'
  }
})

class LogoutSpy implements Logout {
  refreshToken: string
  async logout(refreshToken: string): Promise<void> {
    this.refreshToken = refreshToken
  }
}

class ValidationSpy implements Validation {
  error: Error | null = null
  input: unknown
  validate(input: unknown): Error | null {
    this.input = input
    return this.error
  }
}

type SutTypes = {
  sut: LogoutController
  logoutSpy: LogoutSpy
  validationSpy: ValidationSpy
}

const makeSut = (): SutTypes => {
  const logoutSpy = new LogoutSpy()
  const validationSpy = new ValidationSpy()
  const sut = new LogoutController(logoutSpy, validationSpy)
  return {
    sut,
    logoutSpy,
    validationSpy
  }
}

describe('Logout Controller', () => {
  test('Should call Validation with correct value', async () => {
    const { sut, validationSpy } = makeSut()
    const httpRequest = mockRequest()
    await sut.handle(httpRequest)
    expect(validationSpy.input).toEqual(httpRequest.body)
  })

  test('Should return 400 if Validation returns an error', async () => {
    const { sut, validationSpy } = makeSut()
    validationSpy.error = new MissingParamError('refreshToken')
    const httpResponse = await sut.handle(mockRequest())
    expect(httpResponse).toEqual(badRequest(new MissingParamError('refreshToken')))
  })

  test('Should call Logout with correct value', async () => {
    const { sut, logoutSpy } = makeSut()
    const httpRequest = mockRequest()
    await sut.handle(httpRequest)
    expect(logoutSpy.refreshToken).toBe(httpRequest.body.refreshToken)
  })

  test('Should return 500 if Logout throws', async () => {
    const { sut, logoutSpy } = makeSut()
    jest.spyOn(logoutSpy, 'logout').mockRejectedValueOnce(new Error())
    const httpResponse = await sut.handle(mockRequest())
    expect(httpResponse).toEqual(serverError(new Error()))
  })

  test('Should return 204 on success', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.handle(mockRequest())
    expect(httpResponse).toEqual(noContent())
  })
})
