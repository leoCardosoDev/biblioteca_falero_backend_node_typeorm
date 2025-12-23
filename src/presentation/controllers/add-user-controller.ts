import { Controller, HttpRequest, HttpResponse, Validation } from '@/presentation/protocols'
import { badRequest, serverError, ok, forbidden } from '@/presentation/helpers'
import { AddUser } from '@/domain/usecases/add-user'

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
      const { name, email, rg, cpf, dataNascimento } = httpRequest.body as {
        name: string
        email: string
        rg: string
        cpf: string
        dataNascimento: string
      }
      const userOrError = await this.addUser.add({
        name,
        email,
        rg,
        cpf,
        dataNascimento: new Date(dataNascimento)
      })
      if (userOrError instanceof Error) {
        return forbidden(userOrError)
      }
      return ok(userOrError)
    } catch (error) {
      return serverError(error as Error)
    }
  }
}
