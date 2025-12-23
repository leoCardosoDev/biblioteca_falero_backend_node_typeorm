import { Role } from '@/domain/models'
import { AccessDeniedError } from '@/presentation/errors'
import { forbidden, ok } from '@/presentation/helpers'
import { HttpRequest, HttpResponse, Middleware } from '@/presentation/protocols'

export class RequireRoleMiddleware implements Middleware {
  constructor(private readonly allowedRoles: Role[]) { }

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    const { userId, role } = httpRequest
    if (!userId || !role) {
      return forbidden(new AccessDeniedError())
    }

    const userRole = role as Role
    const isAdmin = userRole === Role.ADMIN
    const isAllowed = this.allowedRoles.length === 0 || this.allowedRoles.includes(userRole)

    if (!isAdmin && !isAllowed) {
      return forbidden(new AccessDeniedError())
    }

    return ok({ userId, role: userRole })
  }
}
