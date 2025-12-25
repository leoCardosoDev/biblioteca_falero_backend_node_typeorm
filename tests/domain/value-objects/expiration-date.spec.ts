import { ExpirationDate } from '@/domain/value-objects/expiration-date'

describe('ExpirationDate Value Object', () => {
  describe('fromDays()', () => {
    test('Should create an expiration date N days from now', () => {
      const days = 7
      const before = new Date()
      const expirationDate = ExpirationDate.fromDays(days)
      const after = new Date()

      const expectedMinDate = new Date(before)
      expectedMinDate.setDate(expectedMinDate.getDate() + days)

      const expectedMaxDate = new Date(after)
      expectedMaxDate.setDate(expectedMaxDate.getDate() + days)

      const result = expirationDate.toDate()
      expect(result.getTime()).toBeGreaterThanOrEqual(expectedMinDate.getTime() - 1000)
      expect(result.getTime()).toBeLessThanOrEqual(expectedMaxDate.getTime() + 1000)
    })

    test('Should throw if days is zero', () => {
      expect(() => ExpirationDate.fromDays(0)).toThrow('Expiration days must be a positive number')
    })

    test('Should throw if days is negative', () => {
      expect(() => ExpirationDate.fromDays(-5)).toThrow('Expiration days must be a positive number')
    })
  })

  describe('fromDate()', () => {
    test('Should create an expiration date from a future date', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 10)

      const expirationDate = ExpirationDate.fromDate(futureDate)
      expect(expirationDate.toDate()).toEqual(futureDate)
    })

    test('Should throw if date is in the past', () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 1)

      expect(() => ExpirationDate.fromDate(pastDate)).toThrow('Expiration date must be in the future')
    })
  })

  describe('isExpired()', () => {
    test('Should return false for a future date', () => {
      const expirationDate = ExpirationDate.fromDays(7)
      expect(expirationDate.isExpired()).toBe(false)
    })
  })

  describe('toDate()', () => {
    test('Should return the underlying Date object', () => {
      const expirationDate = ExpirationDate.fromDays(1)
      expect(expirationDate.toDate()).toBeInstanceOf(Date)
    })
  })
})
