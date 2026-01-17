import { Address } from '@/modules/geography/domain/value-objects/address'
import { InvalidAddressError } from '@/shared/domain/errors'
import { Id } from '@/shared/domain/value-objects/id'

describe('Address Value Object (Geography)', () => {
  const makeValidProps = () => ({
    street: 'Rua das Flores',
    number: '123',
    complement: 'Apt 101',
    neighborhoodId: Id.create('550e8400-e29b-41d4-a716-446655440003') as Id,
    neighborhood: 'Centro',
    cityId: Id.create('550e8400-e29b-41d4-a716-446655440001') as Id,
    city: 'São Paulo',
    stateId: Id.create('550e8400-e29b-41d4-a716-446655440000') as Id,
    state: 'SP',
    zipCode: '01234567'
  })

  describe('create', () => {
    test('Should return InvalidAddressError if street is empty', () => {
      const props = { ...makeValidProps(), street: '' }
      const result = Address.create(props)
      expect(result.isLeft()).toBe(true)
      expect(result.value).toBeInstanceOf(InvalidAddressError)
      expect((result.value as InvalidAddressError).message).toBe('The address street is required')
    })

    test('Should return InvalidAddressError if street is only whitespace', () => {
      const props = { ...makeValidProps(), street: '   ' }
      const result = Address.create(props)
      expect(result.isLeft()).toBe(true)
      expect(result.value).toBeInstanceOf(InvalidAddressError)
    })

    test('Should return InvalidAddressError if number is empty', () => {
      const props = { ...makeValidProps(), number: '' }
      const result = Address.create(props)
      expect(result.isLeft()).toBe(true)
      expect(result.value).toBeInstanceOf(InvalidAddressError)
      expect((result.value as InvalidAddressError).message).toBe('The address number is required')
    })

    test('Should return InvalidAddressError if number is only whitespace', () => {
      const props = { ...makeValidProps(), number: '   ' }
      const result = Address.create(props)
      expect(result.isLeft()).toBe(true)
      expect(result.value).toBeInstanceOf(InvalidAddressError)
    })

    test('Should return InvalidAddressError if neighborhoodId is missing', () => {
      const props = { ...makeValidProps(), neighborhoodId: undefined as unknown as Id }
      const result = Address.create(props)
      expect(result.isLeft()).toBe(true)
      expect(result.value).toBeInstanceOf(InvalidAddressError)
      expect((result.value as InvalidAddressError).message).toBe('The address neighborhood is required')
    })

    test('Should return InvalidAddressError if cityId is missing', () => {
      const props = { ...makeValidProps(), cityId: undefined as unknown as Id }
      const result = Address.create(props)
      expect(result.isLeft()).toBe(true)
      expect(result.value).toBeInstanceOf(InvalidAddressError)
      expect((result.value as InvalidAddressError).message).toBe('The address city is required')
    })

    test('Should return InvalidAddressError if stateId is missing', () => {
      const props = { ...makeValidProps(), stateId: undefined as unknown as Id }
      const result = Address.create(props)
      expect(result.isLeft()).toBe(true)
      expect(result.value).toBeInstanceOf(InvalidAddressError)
      expect((result.value as InvalidAddressError).message).toBe('The address state is required')
    })

    test('Should return InvalidAddressError if zipCode is not 8 digits', () => {
      const props = { ...makeValidProps(), zipCode: '1234' }
      const result = Address.create(props)
      expect(result.isLeft()).toBe(true)
      expect(result.value).toBeInstanceOf(InvalidAddressError)
      expect((result.value as InvalidAddressError).message).toBe('The address zipCode must be 8 digits')
    })

    test('Should return InvalidAddressError if zipCode is too long', () => {
      const props = { ...makeValidProps(), zipCode: '123456789' }
      const result = Address.create(props)
      expect(result.isLeft()).toBe(true)
      expect(result.value).toBeInstanceOf(InvalidAddressError)
    })

    test('Should create valid address with all fields', () => {
      const props = makeValidProps()
      const result = Address.create(props)
      expect(result.isRight()).toBe(true)
      const address = result.value as Address
      expect(address.street).toBe('Rua das Flores')
      expect(address.number).toBe('123')
      expect(address.complement).toBe('Apt 101')
      expect(address.neighborhoodId).toEqual(props.neighborhoodId)
      expect(address.neighborhood).toBe('Centro')
      expect(address.cityId).toEqual(props.cityId)
      expect(address.city).toBe('São Paulo')
      expect(address.stateId).toEqual(props.stateId)
      expect(address.state).toBe('SP')
      expect(address.zipCode).toBe('01234567')
    })

    test('Should trim street and number', () => {
      const props = { ...makeValidProps(), street: '  Rua das Flores  ', number: '  123  ' }
      const result = Address.create(props)
      expect(result.isRight()).toBe(true)
      expect((result.value as Address).street).toBe('Rua das Flores')
      expect((result.value as Address).number).toBe('123')
    })

    test('Should trim complement when provided', () => {
      const props = { ...makeValidProps(), complement: '  Apt 101  ' }
      const result = Address.create(props)
      expect(result.isRight()).toBe(true)
      expect((result.value as Address).complement).toBe('Apt 101')
    })

    test('Should accept undefined complement', () => {
      const props = { ...makeValidProps(), complement: undefined }
      const result = Address.create(props)
      expect(result.isRight()).toBe(true)
      expect((result.value as Address).complement).toBeUndefined()
    })

    test('Should strip non-digit characters from zipCode', () => {
      const props = { ...makeValidProps(), zipCode: '01234-567' }
      const result = Address.create(props)
      expect(result.isRight()).toBe(true)
      expect((result.value as Address).zipCode).toBe('01234567')
    })

    test('Should strip letters from zipCode and validate length', () => {
      const props = { ...makeValidProps(), zipCode: '01234ABC567' }
      const result = Address.create(props)
      expect(result.isRight()).toBe(true)
      expect((result.value as Address).zipCode).toBe('01234567')
    })
  })

  describe('restore', () => {
    test('Should restore address without validation', () => {
      const props = makeValidProps()
      const result = Address.restore(props)
      expect(result).toBeInstanceOf(Address)
      expect(result.street).toBe('Rua das Flores')
      expect(result.number).toBe('123')
      expect(result.complement).toBe('Apt 101')
      expect(result.neighborhoodId).toEqual(props.neighborhoodId)
      expect(result.neighborhood).toBe('Centro')
      expect(result.cityId).toEqual(props.cityId)
      expect(result.city).toBe('São Paulo')
      expect(result.stateId).toEqual(props.stateId)
      expect(result.state).toBe('SP')
      expect(result.zipCode).toBe('01234567')
    })
  })
})
