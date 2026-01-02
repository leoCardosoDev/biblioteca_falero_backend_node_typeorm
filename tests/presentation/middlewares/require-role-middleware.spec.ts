import { HttpRequest } from '@/presentation/protocols'
import { forbidden, ok } from '@/presentation/helpers'
import { AccessDeniedError } from '@/presentation/errors'

import { RequireRoleMiddleware } from '@/presentation/middlewares/require-role-middleware'

const makeFakeRequest = (role: string = 'MEMBER'): HttpRequest => ({
  userId: 'any_user_id',
  role
})

describe('RequireRoleMiddleware', () => {
  beforeAll(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2025-01-01T00:00:00.000Z'))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  test('Should return 403 if no userId is provided', async () => {
    const sut = new RequireRoleMiddleware(['ADMIN'])
    const httpResponse = await sut.handle({})
    expect(httpResponse).toEqual(forbidden(new AccessDeniedError()))
  })

  test('Should return 403 if no role is provided', async () => {
    const sut = new RequireRoleMiddleware(['ADMIN'])
    const httpResponse = await sut.handle({ userId: 'any_id' })
    expect(httpResponse).toEqual(forbidden(new AccessDeniedError()))
  })

  test('Should return 403 if user role is not in allowed roles', async () => {
    const sut = new RequireRoleMiddleware(['ADMIN'])
    const httpResponse = await sut.handle(makeFakeRequest('MEMBER'))
    expect(httpResponse).toEqual(forbidden(new AccessDeniedError()))
  })

  test('Should return 200 if user role is in allowed roles', async () => {
    const sut = new RequireRoleMiddleware(['ADMIN', 'LIBRARIAN'])
    const httpResponse = await sut.handle(makeFakeRequest('LIBRARIAN'))
    expect(httpResponse).toEqual(ok({ userId: 'any_user_id', role: 'LIBRARIAN' }))
  })

  test('Should return 200 for ADMIN even if not in allowed roles (ADMIN bypasses)', async () => {
    const sut = new RequireRoleMiddleware(['LIBRARIAN'])
    const httpResponse = await sut.handle(makeFakeRequest('ADMIN'))
    expect(httpResponse).toEqual(ok({ userId: 'any_user_id', role: 'ADMIN' }))
  })

  test('Should return 200 if allowed roles is empty (any authenticated user)', async () => {
    const sut = new RequireRoleMiddleware([])
    const httpResponse = await sut.handle(makeFakeRequest('MEMBER'))
    expect(httpResponse).toEqual(ok({ userId: 'any_user_id', role: 'MEMBER' }))
  })
})
