import { Address } from '@/domain/value-objects/address'
import { InvalidAddressError } from '@/domain/errors/invalid-address-error'

describe('Address Value Object', () => {
  const validAddressProps = {
    street: 'Rua das Flores',
    number: '123',
    neighborhoodId: 'Centro_ID',
    cityId: 'Sao_Paulo_ID',
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

  test('Should return InvalidAddressError if neighborhoodId is empty', () => {
    const sut = Address.create({ ...validAddressProps, neighborhoodId: '' })
    expect(sut).toBeInstanceOf(InvalidAddressError)
  })

  test('Should return InvalidAddressError if cityId is empty', () => {
    const sut = Address.create({ ...validAddressProps, cityId: '' })
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
    expect((sut as Address).neighborhoodId).toBe('Centro_ID')
    expect((sut as Address).cityId).toBe('Sao_Paulo_ID')
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
