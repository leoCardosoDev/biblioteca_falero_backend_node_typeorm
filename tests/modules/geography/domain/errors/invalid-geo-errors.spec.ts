import { InvalidCityError } from '@/modules/geography/domain/errors/invalid-city-error'
import { InvalidNeighborhoodError } from '@/modules/geography/domain/errors/invalid-neighborhood-error'
import { InvalidStateError } from '@/modules/geography/domain/errors/invalid-state-error'
import { DomainError } from '@/shared/domain/errors'

describe('Geography Domain Errors', () => {
  describe('InvalidCityError', () => {
    test('Should create error with correct message and name', () => {
      const sut = new InvalidCityError('City name is required')
      expect(sut.message).toBe('City name is required')
      expect(sut.name).toBe('InvalidCityError')
      expect(sut).toBeInstanceOf(DomainError)
      expect(sut).toBeInstanceOf(Error)
    })
  })

  describe('InvalidNeighborhoodError', () => {
    test('Should create error with correct message and name', () => {
      const sut = new InvalidNeighborhoodError('Neighborhood name is required')
      expect(sut.message).toBe('Neighborhood name is required')
      expect(sut.name).toBe('InvalidNeighborhoodError')
      expect(sut).toBeInstanceOf(DomainError)
      expect(sut).toBeInstanceOf(Error)
    })
  })

  describe('InvalidStateError', () => {
    test('Should create error with correct message and name', () => {
      const sut = new InvalidStateError('State name is required')
      expect(sut.message).toBe('State name is required')
      expect(sut.name).toBe('InvalidStateError')
      expect(sut).toBeInstanceOf(DomainError)
      expect(sut).toBeInstanceOf(Error)
    })
  })
})
