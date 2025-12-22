import { HttpResponse, HttpRequest, Controller, EmailValidator } from '@/presentation/protocols'
import { MissingParamError, InvalidParamError } from '@/presentation/errors'
import { badRequest, ok, serverError } from '@/presentation/helpers/http-helper'

export class SignUpController implements Controller {
  constructor(private readonly emailValidator: EmailValidator) { }

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const requiredFields = ['name', 'email', 'password', 'passwordConfirmation']
      for (const field of requiredFields) {
        if (!httpRequest.body[field]) {
          return badRequest(new MissingParamError(field))
        }
      }
      if (httpRequest.body.password !== httpRequest.body.passwordConfirmation) {
        return badRequest(new InvalidParamError('passwordConfirmation'))
      }
      const isValid = this.emailValidator.isValid(httpRequest.body.email)
      if (!isValid) {
        return badRequest(new InvalidParamError('email'))
      }
      return ok({
        name: httpRequest.body.name,
        email: httpRequest.body.email,
        password: httpRequest.body.password,
        passwordConfirmation: httpRequest.body.passwordConfirmation
      })
    } catch (error) {
      return serverError(error as Error)
    }
  }
}
