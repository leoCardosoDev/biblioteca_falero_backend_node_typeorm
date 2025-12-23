import { Decrypter } from '@/application/protocols/cryptography/decrypter'
import { AccessDeniedError } from '@/presentation/errors'
import { forbidden, ok, serverError } from '@/presentation/helpers'
import { HttpRequest, HttpResponse, Middleware } from '@/presentation/protocols'

export class AuthMiddleware implements Middleware {
  constructor(private readonly decrypter: Decrypter) { }

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const authHeader = httpRequest.headers?.authorization
      if (!authHeader) {
        return forbidden(new AccessDeniedError())
      }

      const parts = authHeader.split(' ')
      if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return forbidden(new AccessDeniedError())
      }

      const token = parts[1]
      const payload = await this.decrypter.decrypt(token)
      if (!payload) {
        return forbidden(new AccessDeniedError())
      }

      return ok({ userId: payload.id, role: payload.role })
    } catch (error) {
      return serverError(error as Error)
    }
  }
}
