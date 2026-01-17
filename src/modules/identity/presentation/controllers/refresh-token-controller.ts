import { Controller, HttpRequest, HttpResponse } from '@/shared/presentation/protocols'
import { badRequest, ok, serverError, unauthorized } from '@/shared/presentation/helpers/http-helper'
import { Validation } from '@/shared/presentation/protocols/validation'
import { RefreshToken } from '@/modules/identity/domain/usecases/refresh-token'

export class RefreshTokenController implements Controller {
  constructor(
    private readonly refreshToken: RefreshToken,
    private readonly validation: Validation
  ) { }

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const error = this.validation.validate(httpRequest.body)
      if (error) {
        return badRequest(error)
      }

      const { refreshToken } = httpRequest.body as { refreshToken: string }
      const ipAddress = httpRequest.headers?.['x-forwarded-for'] || httpRequest.ip
      const userAgent = httpRequest.headers?.['user-agent']

      const result = await this.refreshToken.refresh({
        refreshToken,
        ipAddress,
        userAgent
      })
      if (!result) {
        return unauthorized()
      }

      return ok(result)
    } catch (error) {
      return serverError(error as Error)
    }
  }
}
