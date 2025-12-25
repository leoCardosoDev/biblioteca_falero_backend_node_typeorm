import { RefreshToken } from '@/domain/usecases/refresh-token'
import { Controller } from '@/presentation/protocols/controller'
import { HttpRequest, HttpResponse } from '@/presentation/protocols/http'
import { Validation } from '@/presentation/protocols/validation'
import { badRequest, serverError, unauthorized, ok } from '@/presentation/helpers/http-helper'

export class RefreshTokenController implements Controller {
  constructor(
    private readonly refreshToken: RefreshToken,
    private readonly validation: Validation
  ) { }

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const error = this.validation.validate(httpRequest.body as Record<string, unknown>)
      if (error) {
        return badRequest(error)
      }

      const { refreshToken } = httpRequest.body as { refreshToken: string }
      const ipAddress = httpRequest.headers?.['x-forwarded-for'] as string || httpRequest.ip
      const userAgent = httpRequest.headers?.['user-agent'] as string

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
