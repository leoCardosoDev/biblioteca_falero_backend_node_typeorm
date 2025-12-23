import { DateValidation } from '@/validation/validators/date-validation'
import { InvalidParamError } from '@/presentation/errors'

const makeSut = (): DateValidation => {
  return new DateValidation('dataNascimento')
}

describe('DateValidation', () => {
  test('Should return undefined if date is valid', () => {
    const sut = makeSut()
    const error = sut.validate({ dataNascimento: '1990-05-20' })
    expect(error).toBeUndefined()
  })

  test('Should return InvalidParamError if date format is invalid', () => {
    const sut = makeSut()
    const error = sut.validate({ dataNascimento: '199005-20' })
    expect(error).toEqual(new InvalidParamError('dataNascimento'))
  })

  test('Should return InvalidParamError if date is not a string', () => {
    const sut = makeSut()
    const error = sut.validate({ dataNascimento: 19900520 })
    expect(error).toEqual(new InvalidParamError('dataNascimento'))
  })

  test('Should return InvalidParamError for impossible date (Feb 30)', () => {
    const sut = makeSut()
    const error = sut.validate({ dataNascimento: '2024-02-30' })
    expect(error).toEqual(new InvalidParamError('dataNascimento'))
  })

  test('Should return InvalidParamError for impossible date (Month 13)', () => {
    const sut = makeSut()
    const error = sut.validate({ dataNascimento: '2024-13-01' })
    expect(error).toEqual(new InvalidParamError('dataNascimento'))
  })

  test('Should accept valid leap year date', () => {
    const sut = makeSut()
    const error = sut.validate({ dataNascimento: '2024-02-29' })
    expect(error).toBeUndefined()
  })
})
