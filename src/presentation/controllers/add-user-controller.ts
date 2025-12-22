import { Controller, HttpRequest, HttpResponse, Validation } from '@/presentation/protocols'
import { badRequest, serverError, ok } from '@/presentation/helpers'
import { AddUser, AddUserParams } from '@/domain/usecases/add-user'

export class AddUserController implements Controller {
  constructor(
    private readonly validation: Validation,
    private readonly addUser: AddUser
  ) { }

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const error = this.validation.validate(httpRequest.body as Record<string, unknown>)
      if (error) {
        return badRequest(error)
      }
      const user = await this.addUser.add(httpRequest.body as AddUserParams)
      return ok(user)
    } catch (error) {
      return serverError(error as Error)
    }
  }
}
