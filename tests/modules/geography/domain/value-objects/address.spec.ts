import { Id } from '@/shared/domain/value-objects/id'
import { Address } from '@/modules/identity/domain/value-objects/address'
import { InvalidAddressError } from '@/shared/domain/errors/invalid-address-error'

describe('Address Value Object', () => {
  const validAddressProps = {
    street: 'Rua das Flores',
    number: '123',
    neighborhoodId: Id.create('550e8400-e29b-41d4-a716-446655440003') as Id,
    cityId: Id.create('550e8400-e29b-41d4-a716-446655440001') as Id,
    stateId: Id.create('550e8400-e29b-41d4-a716-446655440000') as Id,
    zipCode: '01234567'
  }

  test('Should return InvalidAddressError if street is empty', () => {
    const sut = Address.create({ ...validAddressProps, street: '' })
    expect(sut).toBeInstanceOf(InvalidAddressError)
    expect((sut as InvalidAddressError).message).toBe('The address street is required')
  })

  test('Should return InvalidAddressError if number is empty', () => {
    const sut = Address.create({ ...validAddressProps, number: '' })
    expect(sut).toBeInstanceOf(InvalidAddressError)
    expect((sut as InvalidAddressError).message).toBe('The address number is required')
  })

  test('Should return InvalidAddressError if cityId is missing', () => {
    const sut = Address.create({ ...validAddressProps, cityId: undefined as unknown as Id })
    expect(sut).toBeInstanceOf(InvalidAddressError)
    expect((sut as InvalidAddressError).message).toBe('The address city is required')
  })

  test('Should return InvalidAddressError if neighborhoodId is missing', () => {
    const sut = Address.create({ ...validAddressProps, neighborhoodId: undefined as unknown as Id })
    expect(sut).toBeInstanceOf(InvalidAddressError)
    expect((sut as InvalidAddressError).message).toBe('The address neighborhood is required')
  })

  test('Should return InvalidAddressError if stateId is missing', () => {
    const sut = Address.create({ ...validAddressProps, stateId: undefined as unknown as Id })
    expect(sut).toBeInstanceOf(InvalidAddressError)
    expect((sut as InvalidAddressError).message).toBe('The address state is required')
  })

  // Removed empty ID string tests because now we pass objects, type check prevents strings.
  // We could test for undefined if we want, but TS handles strict null checks.
  // However, we should still ensure the properties are correctly assigned.

  test('Should return InvalidAddressError if zipCode is not 8 digits', () => {
    const sut = Address.create({ ...validAddressProps, zipCode: '1234' })
    expect(sut).toBeInstanceOf(InvalidAddressError)
    expect((sut as InvalidAddressError).message).toBe('The address zipCode must be 8 digits')
  })

  test('Should create a valid address', () => {
    const sut = Address.create(validAddressProps)
    expect(sut).toBeInstanceOf(Address)
    expect((sut as Address).street).toBe('Rua das Flores')
    expect((sut as Address).number).toBe('123')
    expect((sut as Address).neighborhoodId).toEqual(validAddressProps.neighborhoodId)
    expect((sut as Address).cityId).toEqual(validAddressProps.cityId)
    expect((sut as Address).stateId).toEqual(validAddressProps.stateId)
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
