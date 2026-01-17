import { ServerError } from '@/shared/presentation/errors/server-error'

describe('ServerError', () => {
  test('Should return stack if provided', () => {
    const sut = new ServerError('any_stack')
    expect(sut.stack).toBe('any_stack')
  })

  test('Should have correct name and message', () => {
    const sut = new ServerError()
    expect(sut.name).toBe('ServerError')
    expect(sut.message).toBe('Internal server error')
    expect(sut.code).toBe('INTERNAL_ERROR')
  })
})
