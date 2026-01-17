import { AppError } from '@/shared/domain/errors/app-error'

describe('AppError', () => {
  test('Should use APP_ERROR as default code when not provided', () => {
    const error = new AppError('any_message')
    expect(error.message).toBe('any_message')
    expect(error.code).toBe('APP_ERROR')
    expect(error.name).toBe('AppError')
    expect(error.details).toBeUndefined()
  })

  test('Should use provided code', () => {
    const error = new AppError('any_message', 'CUSTOM_CODE')
    expect(error.code).toBe('CUSTOM_CODE')
  })

  test('Should use provided details', () => {
    const details = [{ field: 'any_field' }]
    const error = new AppError('any_message', 'CUSTOM_CODE', details)
    expect(error.details).toEqual(details)
  })
})
