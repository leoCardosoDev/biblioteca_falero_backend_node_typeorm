import { Controller, HttpRequest, HttpResponse } from '@/shared/presentation/protocols'
import { badRequest, noContent, serverError } from '@/shared/presentation/helpers/http-helper'
import { Validation } from '@/shared/presentation/protocols/validation'
import { Logout } from '@/modules/identity/domain/usecases/logout'

export class LogoutController implements Controller {
  constructor(
    private readonly logout: Logout,
    private readonly validation: Validation
  ) { }

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const error = this.validation.validate(httpRequest.body)
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
