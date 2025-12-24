import { BirthDate } from '@/domain/value-objects/birth-date'
import { InvalidBirthDateError } from '@/domain/errors/invalid-birth-date-error'

describe('BirthDate Value Object', () => {
  test('Should return InvalidBirthDateError if date is empty', () => {
    const sut = BirthDate.create('')
    expect(sut).toEqual(new InvalidBirthDateError(''))
  })

  test('Should return InvalidBirthDateError if date is invalid format', () => {
    const sut = BirthDate.create('not-a-date')
    expect(sut).toBeInstanceOf(InvalidBirthDateError)
  })

  test('Should return InvalidBirthDateError if date is in the future', () => {
    const futureDate = new Date()
    futureDate.setFullYear(futureDate.getFullYear() + 1)
    const sut = BirthDate.create(futureDate.toISOString().split('T')[0])
    expect(sut).toBeInstanceOf(InvalidBirthDateError)
  })

  test('Should create a valid birth date (ISO format)', () => {
    const sut = BirthDate.create('1990-01-15')
    expect(sut).toBeInstanceOf(BirthDate)
    expect((sut as BirthDate).value).toBe('1990-01-15')
  })
})
