import { Neighborhood } from '@/modules/geography/domain/entities/neighborhood'
import { City } from '@/modules/geography/domain/entities/city'
import { State } from '@/modules/geography/domain/entities/state'
import { InvalidParamError } from '@/shared/domain/errors/invalid-param-error'

describe('Geography Value Objects', () => {
  describe('Neighborhood', () => {
    test('Should create Neighborhood with normalized name', () => {
      const sut = Neighborhood.create('  any neighborhood  ')
      expect((sut as Neighborhood).value).toBe('ANY NEIGHBORHOOD')
    })

    test('Should return InvalidParamError if name is empty', () => {
      const sut = Neighborhood.create('   ')
      expect(sut).toBeInstanceOf(InvalidParamError)
    })
  })

  describe('City', () => {
    test('Should create City with normalized name', () => {
      const sut = City.create('  any city  ')
      expect((sut as City).value).toBe('ANY CITY')
    })

    test('Should return InvalidParamError if name is empty', () => {
      const sut = City.create('')
      expect(sut).toBeInstanceOf(InvalidParamError)
    })
  })

  describe('State', () => {
    test('Should create State with normalized name', () => {
      const sut = State.create('  sp  ')
      expect((sut as State).value).toBe('SP')
    })

    test('Should return InvalidParamError if name is empty', () => {
      const sut = State.create('')
      expect(sut).toBeInstanceOf(InvalidParamError)
    })
  })
})
