import { Role } from '@/domain/models'
import { RequireRoleMiddleware } from '@/presentation/middlewares/require-role-middleware'
import { Middleware } from '@/presentation/protocols'

export const makeRequireRoleMiddleware = (allowedRoles: Role[]): Middleware => {
  return new RequireRoleMiddleware(allowedRoles)
}

export const makeAdminOnly = (): Middleware => {
  return makeRequireRoleMiddleware([Role.ADMIN])
}

export const makeLibrarianOrAdmin = (): Middleware => {
  return makeRequireRoleMiddleware([Role.ADMIN, Role.LIBRARIAN])
}

export const makeAuthenticatedOnly = (): Middleware => {
  return makeRequireRoleMiddleware([])
}
