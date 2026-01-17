import { City } from '@/modules/geography/domain/entities/city'
import { InvalidCityError } from '@/modules/geography/domain/errors'
import { Id } from '@/shared/domain/value-objects/id'

describe('City Entity', () => {
  const makeValidProps = () => ({
    id: Id.create('550e8400-e29b-41d4-a716-446655440001') as Id,
    name: 'São Paulo',
    stateId: Id.create('550e8400-e29b-41d4-a716-446655440000') as Id
  })

  describe('create', () => {
    test('Should return InvalidCityError if name is empty', () => {
      const props = { ...makeValidProps(), name: '' }
      const result = City.create(props)
      expect(result.isLeft()).toBe(true)
      expect(result.value).toBeInstanceOf(InvalidCityError)
      expect((result.value as InvalidCityError).message).toBe('City name is required')
    })

    test('Should return InvalidCityError if name is only whitespace', () => {
      const props = { ...makeValidProps(), name: '   ' }
      const result = City.create(props)
      expect(result.isLeft()).toBe(true)
      expect(result.value).toBeInstanceOf(InvalidCityError)
    })

    test('Should create valid city with trimmed name', () => {
      const props = { ...makeValidProps(), name: '  São Paulo  ' }
      const result = City.create(props)
      expect(result.isRight()).toBe(true)
      expect((result.value as City).name).toBe('São Paulo')
      expect((result.value as City).id).toEqual(props.id)
      expect((result.value as City).stateId).toEqual(props.stateId)
    })
  })

  describe('restore', () => {
    test('Should restore city without validation', () => {
      const props = makeValidProps()
      const result = City.restore(props)
      expect(result).toBeInstanceOf(City)
      expect(result.name).toBe('São Paulo')
      expect(result.id).toEqual(props.id)
      expect(result.stateId).toEqual(props.stateId)
    })
  })
})
