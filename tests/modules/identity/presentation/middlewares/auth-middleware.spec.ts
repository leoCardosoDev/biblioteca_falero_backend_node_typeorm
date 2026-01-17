import { HttpRequest } from '@/shared/presentation/protocols'
import { forbidden, ok, serverError } from '@/shared/presentation/helpers/http-helper'
import { AccessDeniedError } from '@/shared/domain/errors/access-denied-error'
import { Decrypter } from '@/shared/application/protocols/cryptography/decrypter'
import { TokenPayload } from '@/modules/identity/domain/entities'
import { AuthMiddleware } from '@/modules/identity/presentation/middlewares/auth-middleware'

type SutTypes = {
  sut: AuthMiddleware
  decrypterStub: Decrypter
}

const makeDecrypter = (): Decrypter => {
  class DecrypterStub implements Decrypter {
    async decrypt(_ciphertext: string): Promise<TokenPayload | undefined> {
      return await Promise.resolve({ id: 'any_id', role: 'STUDENT' })
    }
  }
  return new DecrypterStub()
}

const makeSut = (): SutTypes => {
  const decrypterStub = makeDecrypter()
  const sut = new AuthMiddleware(decrypterStub)
  return { sut, decrypterStub }
}

const makeFakeRequest = (): HttpRequest => ({
  headers: {
    authorization: 'Bearer any_token'
  }
})

describe('AuthMiddleware', () => {
  beforeAll(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2025-01-01T00:00:00.000Z'))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  test('Should return 403 if no authorization header is provided', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.handle({})
    expect(httpResponse).toEqual(forbidden(new AccessDeniedError()))
  })

  test('Should return 403 if authorization header has invalid format', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.handle({ headers: { authorization: 'invalid_format' } })
    expect(httpResponse).toEqual(forbidden(new AccessDeniedError()))
  })

  test('Should call Decrypter with correct token', async () => {
    const { sut, decrypterStub } = makeSut()
    const decryptSpy = jest.spyOn(decrypterStub, 'decrypt')
    await sut.handle(makeFakeRequest())
    expect(decryptSpy).toHaveBeenCalledWith('any_token')
  })

  test('Should return 403 if Decrypter returns undefined', async () => {
    const { sut, decrypterStub } = makeSut()
    jest.spyOn(decrypterStub, 'decrypt').mockResolvedValueOnce(undefined)
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(forbidden(new AccessDeniedError()))
  })

  test('Should return 500 if Decrypter throws', async () => {
    const { sut, decrypterStub } = makeSut()
    jest.spyOn(decrypterStub, 'decrypt').mockRejectedValueOnce(new Error())
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(serverError(new Error()))
  })

  test('Should return 200 with userId and role on success', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(ok({ userId: 'any_id', role: 'STUDENT' }))
  })
})
