import { AppError } from '@/shared/application/errors/app-error'

describe('AppError (Application)', () => {
  test('Should create error with code and message', () => {
    const sut = new AppError('CODE_001', 'Error message')
    expect(sut.code).toBe('CODE_001')
    expect(sut.message).toBe('Error message')
    expect(sut.details).toBeUndefined()
    expect(sut.name).toBe('AppError')
    expect(sut).toBeInstanceOf(Error)
  })

  test('Should create error with code, message and details', () => {
    const details = { field: 'email', reason: 'invalid' }
    const sut = new AppError('CODE_002', 'Validation failed', details)
    expect(sut.code).toBe('CODE_002')
    expect(sut.message).toBe('Validation failed')
    expect(sut.details).toEqual(details)
  })

  test('Should inherit from Error', () => {
    const sut = new AppError('ANY_CODE', 'any message')
    expect(sut).toBeInstanceOf(Error)
  })
})
