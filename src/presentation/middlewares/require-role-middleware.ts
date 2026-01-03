
import { HttpRequest, HttpResponse, Middleware, forbidden, ok, AccessDeniedError } from '@/presentation'

export class RequireRoleMiddleware implements Middleware {
  constructor(private readonly allowedRoles: string[]) { }

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    const { userId, role } = httpRequest
    if (!userId || !role) {
      return forbidden(new AccessDeniedError())
    }

    const userRole = role.toUpperCase()
    const isAdmin = userRole === 'ADMIN'
    const isAllowed = this.allowedRoles.length === 0 || this.allowedRoles.includes(userRole)

    if (!isAdmin && !isAllowed) {
      return forbidden(new AccessDeniedError())
    }

    return ok({ userId, role: userRole })
  }
}
