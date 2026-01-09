import { Logout } from '@/domain/usecases/logout'
import { Controller } from '@/presentation/protocols/controller'
import { HttpRequest, HttpResponse } from '@/presentation/protocols/http'
import { Validation } from '@/presentation/protocols/validation'
import { badRequest, serverError, noContent } from '@/presentation/helpers/http-helper'

export class LogoutController implements Controller {
  constructor(
    private readonly logout: Logout,
    private readonly validation: Validation
  ) { }

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const error = this.validation.validate(httpRequest.body as Record<string, unknown>)
      if (error) {
        return badRequest(error)
      }

      const { refreshToken } = httpRequest.body as { refreshToken: string }
      await this.logout.logout(refreshToken)

      return noContent()
    } catch (error) {
      return serverError(error as Error)
    }
  }
}
