import { Address } from '@/domain/value-objects/address'
import { InvalidAddressError } from '@/domain/errors/invalid-address-error'

describe('Address Value Object', () => {
  const validAddressProps = {
    street: 'Rua das Flores',
    number: '123',
    neighborhood: 'Centro',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01234567'
  }

  test('Should return InvalidAddressError if street is empty', () => {
    const sut = Address.create({ ...validAddressProps, street: '' })
    expect(sut).toBeInstanceOf(InvalidAddressError)
  })

  test('Should return InvalidAddressError if number is empty', () => {
    const sut = Address.create({ ...validAddressProps, number: '' })
    expect(sut).toBeInstanceOf(InvalidAddressError)
  })

  test('Should return InvalidAddressError if neighborhood is empty', () => {
    const sut = Address.create({ ...validAddressProps, neighborhood: '' })
    expect(sut).toBeInstanceOf(InvalidAddressError)
  })

  test('Should return InvalidAddressError if city is empty', () => {
    const sut = Address.create({ ...validAddressProps, city: '' })
    expect(sut).toBeInstanceOf(InvalidAddressError)
  })

  test('Should return InvalidAddressError if state is not 2 chars', () => {
    const sut = Address.create({ ...validAddressProps, state: 'SPX' })
    expect(sut).toBeInstanceOf(InvalidAddressError)
  })

  test('Should return InvalidAddressError if zipCode is not 8 digits', () => {
    const sut = Address.create({ ...validAddressProps, zipCode: '1234' })
    expect(sut).toBeInstanceOf(InvalidAddressError)
  })

  test('Should create a valid address', () => {
    const sut = Address.create(validAddressProps)
    expect(sut).toBeInstanceOf(Address)
    expect((sut as Address).street).toBe('Rua das Flores')
    expect((sut as Address).number).toBe('123')
    expect((sut as Address).neighborhood).toBe('Centro')
    expect((sut as Address).city).toBe('São Paulo')
    expect((sut as Address).state).toBe('SP')
    expect((sut as Address).zipCode).toBe('01234567')
  })

  test('Should accept optional complement', () => {
    const sut = Address.create({ ...validAddressProps, complement: 'Apt 101' })
    expect((sut as Address).complement).toBe('Apt 101')
  })

  test('Should strip non-digit chars from zipCode', () => {
    const sut = Address.create({ ...validAddressProps, zipCode: '01234-567' })
    expect((sut as Address).zipCode).toBe('01234567')
  })
})
