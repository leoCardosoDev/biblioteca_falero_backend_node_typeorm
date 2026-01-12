
import { ZodAddNeighborhoodValidator } from '@/infra/validators/zod-add-neighborhood-validation'

describe('ZodAddNeighborhoodValidator', () => {
  test('Should return error if validation fails', () => {
    const sut = new ZodAddNeighborhoodValidator()
    const error = sut.validate({ name: '', city_id: 'invalid-uuid' })
    expect(error).toBeTruthy()
    expect(error?.name).toBe('ValidationError')
  })

  test('Should return undefined if validation succeeds', () => {
    const sut = new ZodAddNeighborhoodValidator()
    const error = sut.validate({ name: 'Valid Name', city_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
    expect(error).toBeUndefined()
  })
})
