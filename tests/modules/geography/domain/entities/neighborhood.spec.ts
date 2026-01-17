import { Neighborhood } from '@/modules/geography/domain/entities/neighborhood'
import { InvalidNeighborhoodError } from '@/modules/geography/domain/errors'
import { Id } from '@/shared/domain/value-objects/id'

describe('Neighborhood Entity', () => {
  const makeValidProps = () => ({
    id: Id.create('550e8400-e29b-41d4-a716-446655440002') as Id,
    name: 'Centro',
    cityId: Id.create('550e8400-e29b-41d4-a716-446655440001') as Id
  })

  describe('create', () => {
    test('Should return InvalidNeighborhoodError if name is empty', () => {
      const props = { ...makeValidProps(), name: '' }
      const result = Neighborhood.create(props)
      expect(result.isLeft()).toBe(true)
      expect(result.value).toBeInstanceOf(InvalidNeighborhoodError)
      expect((result.value as InvalidNeighborhoodError).message).toBe('Neighborhood name is required')
    })

    test('Should return InvalidNeighborhoodError if name is only whitespace', () => {
      const props = { ...makeValidProps(), name: '   ' }
      const result = Neighborhood.create(props)
      expect(result.isLeft()).toBe(true)
      expect(result.value).toBeInstanceOf(InvalidNeighborhoodError)
    })

    test('Should create valid neighborhood with trimmed name', () => {
      const props = { ...makeValidProps(), name: '  Centro  ' }
      const result = Neighborhood.create(props)
      expect(result.isRight()).toBe(true)
      expect((result.value as Neighborhood).name).toBe('Centro')
      expect((result.value as Neighborhood).id).toEqual(props.id)
      expect((result.value as Neighborhood).cityId).toEqual(props.cityId)
    })
  })

  describe('restore', () => {
    test('Should restore neighborhood without validation', () => {
      const props = makeValidProps()
      const result = Neighborhood.restore(props)
      expect(result).toBeInstanceOf(Neighborhood)
      expect(result.name).toBe('Centro')
      expect(result.id).toEqual(props.id)
      expect(result.cityId).toEqual(props.cityId)
    })
  })
})
