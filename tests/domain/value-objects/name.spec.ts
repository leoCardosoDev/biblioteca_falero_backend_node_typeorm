import { Name } from '@/domain/value-objects/name'
import { InvalidNameError } from '@/domain/errors/invalid-name-error'

describe('Name Value Object', () => {
  test('Should return InvalidNameError if name is empty', () => {
    const sut = Name.create('')
    expect(sut).toEqual(new InvalidNameError(''))
  })

  test('Should return InvalidNameError if name has less than 2 characters', () => {
    const sut = Name.create('a')
    expect(sut).toEqual(new InvalidNameError('a'))
  })

  test('Should create a valid name', () => {
    const sut = Name.create('Leo')
    expect(sut).toBeInstanceOf(Name)
    expect((sut as Name).value).toBe('Leo')
  })

  test('Should trim the name', () => {
    const sut = Name.create('  Leo  ')
    expect((sut as Name).value).toBe('Leo')
  })
})
