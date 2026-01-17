import { RequireRoleMiddleware } from '@/modules/identity/presentation/middlewares/require-role-middleware'
import { Middleware } from '@/shared/presentation/protocols'

export const makeRequireRoleMiddleware = (allowedRoles: string[]): Middleware => {
  return new RequireRoleMiddleware(allowedRoles)
}

export const makeAdminOnly = (): Middleware => {
  return makeRequireRoleMiddleware(['ADMIN'])
}

export const makeLibrarianOrAdmin = (): Middleware => {
  return makeRequireRoleMiddleware(['ADMIN', 'LIBRARIAN'])
}

export const makeAuthenticatedOnly = (): Middleware => {
  return makeRequireRoleMiddleware([])
}
