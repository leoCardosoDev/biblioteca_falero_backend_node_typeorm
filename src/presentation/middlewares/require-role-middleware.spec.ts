import { HttpRequest } from '@/presentation/protocols'
import { forbidden, ok } from '@/presentation/helpers'
import { AccessDeniedError } from '@/presentation/errors'
import { Role } from '@/domain/models'
import { RequireRoleMiddleware } from './require-role-middleware'

const makeFakeRequest = (role: Role = Role.MEMBER): HttpRequest => ({
  userId: 'any_user_id',
  role
})

describe('RequireRoleMiddleware', () => {
  test('Should return 403 if no userId is provided', async () => {
    const sut = new RequireRoleMiddleware([Role.ADMIN])
    const httpResponse = await sut.handle({})
    expect(httpResponse).toEqual(forbidden(new AccessDeniedError()))
  })

  test('Should return 403 if no role is provided', async () => {
    const sut = new RequireRoleMiddleware([Role.ADMIN])
    const httpResponse = await sut.handle({ userId: 'any_id' })
    expect(httpResponse).toEqual(forbidden(new AccessDeniedError()))
  })

  test('Should return 403 if user role is not in allowed roles', async () => {
    const sut = new RequireRoleMiddleware([Role.ADMIN])
    const httpResponse = await sut.handle(makeFakeRequest(Role.MEMBER))
    expect(httpResponse).toEqual(forbidden(new AccessDeniedError()))
  })

  test('Should return 200 if user role is in allowed roles', async () => {
    const sut = new RequireRoleMiddleware([Role.ADMIN, Role.LIBRARIAN])
    const httpResponse = await sut.handle(makeFakeRequest(Role.LIBRARIAN))
    expect(httpResponse).toEqual(ok({ userId: 'any_user_id', role: Role.LIBRARIAN }))
  })

  test('Should return 200 for ADMIN even if not in allowed roles (ADMIN bypasses)', async () => {
    const sut = new RequireRoleMiddleware([Role.LIBRARIAN])
    const httpResponse = await sut.handle(makeFakeRequest(Role.ADMIN))
    expect(httpResponse).toEqual(ok({ userId: 'any_user_id', role: Role.ADMIN }))
  })

  test('Should return 200 if allowed roles is empty (any authenticated user)', async () => {
    const sut = new RequireRoleMiddleware([])
    const httpResponse = await sut.handle(makeFakeRequest(Role.MEMBER))
    expect(httpResponse).toEqual(ok({ userId: 'any_user_id', role: Role.MEMBER }))
  })
})
