
import { left, right } from '@/shared/either'

describe('Either', () => {
  test('Should return true if isLeft is called on Left', () => {
    const sut = left('any_value')
    expect(sut.isLeft()).toBe(true)
    expect(sut.isRight()).toBe(false)
  })

  test('Should return true if isRight is called on Right', () => {
    const sut = right('any_value')
    expect(sut.isRight()).toBe(true)
    expect(sut.isLeft()).toBe(false)
  })

  test('Should return value on Left', () => {
    const sut = left('any_error')
    expect(sut.value).toBe('any_error')
  })

  test('Should return value on Right', () => {
    const sut = right('any_success')
    expect(sut.value).toBe('any_success')
  })
})
