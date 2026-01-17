import { Middleware, HttpRequest, HttpResponse } from '@/shared/presentation/protocols'
import { forbidden, ok, serverError } from '@/shared/presentation/helpers/http-helper'
import { AccessDeniedError } from '@/shared/domain/errors/access-denied-error'

export class RequireRoleMiddleware implements Middleware {
  constructor(private readonly allowedRoles: string[]) { }

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      if (this.allowedRoles.length === 0) {
        return ok({ userId: httpRequest.userId, role: httpRequest.role })
      }
      const { role } = httpRequest

      if (!role) {
        return forbidden(new AccessDeniedError())
      }

      if (role === 'ADMIN' || !this.allowedRoles.includes(role)) {
        if (role !== 'ADMIN') {
          return forbidden(new AccessDeniedError())
        }
      }

      return ok({ userId: httpRequest.userId, role })
    } catch (error) {
      return serverError(error as Error)
    }
  }
}
