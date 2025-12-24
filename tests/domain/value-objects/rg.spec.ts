import { Rg } from '@/domain/value-objects/rg'
import { InvalidRgError } from '@/domain/errors/invalid-rg-error'

describe('Rg Value Object', () => {
  test('Should return InvalidRgError if rg is empty', () => {
    const sut = Rg.create('')
    expect(sut).toEqual(new InvalidRgError(''))
  })

  test('Should create a valid rg', () => {
    const sut = Rg.create('123456789')
    expect(sut).toBeInstanceOf(Rg)
    expect((sut as Rg).value).toBe('123456789')
  })

  test('Should strip formatting (dots and hyphens)', () => {
    const sut = Rg.create('12.345.678-9')
    expect((sut as Rg).value).toBe('123456789')
  })

  test('Should accept X character (common in RGs)', () => {
    const sut = Rg.create('1234567X')
    expect((sut as Rg).value).toBe('1234567X')
  })

  test('Should return InvalidRgError for invalid characters (special symbols)', () => {
    const sut = Rg.create('123@456')
    expect(sut).toEqual(new InvalidRgError('123@456'))
  })
})
