import { Controller, HttpRequest, HttpResponse } from '@/shared/presentation/protocols'
import { badRequest, ok, serverError, unauthorized } from '@/shared/presentation/helpers/http-helper'
import { Validation } from '@/shared/presentation/protocols/validation'
import { Authentication } from '@/modules/identity/application/usecases/authentication'
import { Email } from '@/modules/identity/domain/value-objects/email'

export class LoginController implements Controller {
  constructor(
    private readonly authentication: Authentication,
    private readonly validation: Validation
  ) { }

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const error = this.validation.validate(httpRequest.body)
      if (error) {
        return badRequest(error)
      }

      const { email, password } = httpRequest.body as { email: string; password: string }

      let emailVO: Email
      try {
        emailVO = Email.create(email)
      } catch (emailError) {
        return badRequest(emailError as Error)
      }

      const authenticationModel = await this.authentication.auth({
        email: emailVO,
        password
      })

      if (!authenticationModel) {
        return unauthorized()
      }

      return ok(authenticationModel)
    } catch (error) {
      return serverError(error as Error)
    }
  }
}
