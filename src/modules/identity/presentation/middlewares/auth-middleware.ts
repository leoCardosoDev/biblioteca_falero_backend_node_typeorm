import { Middleware, HttpRequest, HttpResponse } from '@/shared/presentation/protocols'
import { forbidden, ok, serverError } from '@/shared/presentation/helpers/http-helper'
import { AccessDeniedError } from '@/shared/domain/errors/access-denied-error'
import { Decrypter } from '@/shared/application/protocols/cryptography/decrypter'

export class AuthMiddleware implements Middleware {
  constructor(
    private readonly decrypter: Decrypter
  ) { }

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      let accessToken = httpRequest.headers?.['x-access-token']
      if (!accessToken && httpRequest.headers?.authorization) {
        const authHeader = httpRequest.headers.authorization
        if (authHeader.startsWith('Bearer ')) {
          accessToken = authHeader.substring(7)
        }
      }
      if (accessToken) {
        const payload = await this.decrypter.decrypt(accessToken) as { id: string; role?: string }
        if (payload) {
          return ok({ userId: payload.id, role: payload.role })
        }
      }
      return forbidden(new AccessDeniedError())
    } catch (error) {
      return serverError(error as Error)
    }
  }
}
