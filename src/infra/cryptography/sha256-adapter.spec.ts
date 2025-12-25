import crypto, { Hash } from 'crypto'
import { Sha256Adapter } from './sha256-adapter'

jest.mock('crypto', () => ({
  createHash: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  digest: jest.fn()
}))

const makeSut = (): Sha256Adapter => {
  return new Sha256Adapter()
}

describe('Sha256 Adapter', () => {
  describe('hash()', () => {
    test('Should call crypto.createHash with correct values', async () => {
      const sut = makeSut()
      const createHashSpy = jest.spyOn(crypto, 'createHash')
      await sut.hash('any_value')
      expect(createHashSpy).toHaveBeenCalledWith('sha256')
    })

    test('Should return a hash on success', async () => {
      const sut = makeSut()
      jest.spyOn(crypto, 'createHash').mockImplementationOnce(() => ({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValueOnce('hash_value')
      } as unknown as Hash))
      const hash = await sut.hash('any_value')
      expect(hash).toBe('hash_value')
    })

    test('Should throw if crypto throws', async () => {
      const sut = makeSut()
      jest.spyOn(crypto, 'createHash').mockImplementationOnce(() => {
        throw new Error()
      })
      const promise = sut.hash('any_value')
      await expect(promise).rejects.toThrow()
    })
  })

  describe('compare()', () => {
    test('Should return true when hash matches', async () => {
      const sut = makeSut()
      jest.spyOn(crypto, 'createHash').mockImplementationOnce(() => ({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValueOnce('hash_value')
      } as unknown as Hash))
      const isValid = await sut.compare('any_value', 'hash_value')
      expect(isValid).toBe(true)
    })

    test('Should return false when hash does not match', async () => {
      const sut = makeSut()
      jest.spyOn(crypto, 'createHash').mockImplementationOnce(() => ({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValueOnce('other_hash')
      } as unknown as Hash))
      const isValid = await sut.compare('any_value', 'hash_value')
      expect(isValid).toBe(false)
    })
  })
})
