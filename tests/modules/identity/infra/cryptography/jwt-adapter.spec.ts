import jwt from 'jsonwebtoken'


import { JwtAdapter } from '@/shared/infra/cryptography/jwt-adapter'

jest.mock('jsonwebtoken', () => ({
  sign(): string {
    return 'any_token'
  },
  verify(): { id: string, role: string } {
    return { id: 'any_value', role: 'STUDENT' }
  }
}))

const makeSut = (): JwtAdapter => {
  return new JwtAdapter('secret')
}

describe('Jwt Adapter', () => {
  describe('sign()', () => {
    test('Should call sign with correct values', async () => {
      const sut = makeSut()
      const signSpy = jest.spyOn(jwt, 'sign')
      await sut.encrypt({ id: 'any_id', role: 'ADMIN' })
      expect(signSpy).toHaveBeenCalledWith({ id: 'any_id', role: 'ADMIN' }, 'secret')
    })

    test('Should return a token on sign success', async () => {
      const sut = makeSut()
      const accessToken = await sut.encrypt({ id: 'any_id', role: 'ADMIN' })
      expect(accessToken).toBe('any_token')
    })

    test('Should throw if sign throws', async () => {
      const sut = makeSut()
      jest.spyOn(jwt, 'sign').mockImplementationOnce(() => {
        throw new Error()
      })
      const promise = sut.encrypt({ id: 'any_id', role: 'ADMIN' })
      await expect(promise).rejects.toThrow()
    })
  })

  describe('verify()', () => {
    test('Should call verify with correct values', async () => {
      const sut = makeSut()
      const verifySpy = jest.spyOn(jwt, 'verify')
      await sut.decrypt('any_token')
      expect(verifySpy).toHaveBeenCalledWith('any_token', 'secret')
    })

    test('Should return TokenPayload on verify success', async () => {
      const sut = makeSut()
      const value = await sut.decrypt('any_token')
      expect(value).toEqual({ id: 'any_value', role: 'STUDENT' })
    })

    test('Should return undefined if decoded id is missing', async () => {
      const sut = makeSut()
      jest.spyOn(jwt, 'verify').mockImplementationOnce(() => ({}))
      const value = await sut.decrypt('any_token')
      expect(value).toBeUndefined()
    })

    test('Should default to STUDENT role if role is missing', async () => {
      const sut = makeSut()
      jest.spyOn(jwt, 'verify').mockImplementationOnce(() => ({ id: 'any_id' }))
      const value = await sut.decrypt('any_token')
      expect(value).toEqual({ id: 'any_id', role: 'STUDENT' })
    })

    test('Should throw if verify throws', async () => {
      const sut = makeSut()
      jest.spyOn(jwt, 'verify').mockImplementationOnce(() => {
        throw new Error()
      })
      const promise = sut.decrypt('any_token')
      await expect(promise).rejects.toThrow()
    })
  })
})
