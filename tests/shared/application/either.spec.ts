import { Left, Right, left, right } from '@/shared/application/either'

describe('Either', () => {
  describe('Left', () => {
    test('Should return true if isLeft is called on Left', () => {
      const sut = left('any_value')
      expect(sut.isLeft()).toBe(true)
    })

    test('Should return false if isRight is called on Left', () => {
      const sut = left('any_value')
      expect(sut.isRight()).toBe(false)
    })

    test('Should return value on Left', () => {
      const sut = left('any_error')
      expect(sut.value).toBe('any_error')
    })

    test('Should be instance of Left', () => {
      const sut = left('any_error')
      expect(sut).toBeInstanceOf(Left)
    })
  })

  describe('Right', () => {
    test('Should return true if isRight is called on Right', () => {
      const sut = right('any_value')
      expect(sut.isRight()).toBe(true)
    })

    test('Should return false if isLeft is called on Right', () => {
      const sut = right('any_value')
      expect(sut.isLeft()).toBe(false)
    })

    test('Should return value on Right', () => {
      const sut = right('any_success')
      expect(sut.value).toBe('any_success')
    })

    test('Should be instance of Right', () => {
      const sut = right('any_success')
      expect(sut).toBeInstanceOf(Right)
    })
  })
})
