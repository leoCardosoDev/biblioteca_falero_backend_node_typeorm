import { Controller, HttpRequest, HttpResponse, Validation } from '@/presentation/protocols'
import { badRequest, serverError, ok } from '@/presentation/helpers'
import { AddLogin, AddLoginParams } from '@/domain/usecases/add-login'

export class AddLoginController implements Controller {
  constructor(
    private readonly validation: Validation,
    private readonly addLogin: AddLogin
  ) { }

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const error = this.validation.validate(httpRequest.body)
      if (error) {
        return badRequest(error)
      }
      const login = await this.addLogin.add(httpRequest.body as AddLoginParams)
      return ok(login)
    } catch (error) {
      return serverError(error as Error)
    }
  }
}
