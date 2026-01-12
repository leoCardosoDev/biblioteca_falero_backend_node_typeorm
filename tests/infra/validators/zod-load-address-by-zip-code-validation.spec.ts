
import { ZodLoadAddressByZipCodeValidator } from '@/infra/validators/zod-load-address-by-zip-code-validation'

describe('ZodLoadAddressByZipCodeValidator', () => {
  test('Should return error if validation fails', () => {
    const sut = new ZodLoadAddressByZipCodeValidator()
    const error = sut.validate({ zipCode: 'invalid' })
    expect(error).toBeTruthy()
    expect(error?.name).toBe('ValidationError')
  })

  test('Should return undefined if validation succeeds', () => {
    const sut = new ZodLoadAddressByZipCodeValidator()
    const error = sut.validate({ zipCode: '12345678' })
    expect(error).toBeUndefined()
  })
})
