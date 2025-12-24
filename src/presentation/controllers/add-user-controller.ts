import { Controller, HttpRequest, HttpResponse, Validation } from '@/presentation/protocols'
import { badRequest, serverError, ok, forbidden } from '@/presentation/helpers'
import { AddUser } from '@/domain/usecases/add-user'
import { Email } from '@/domain/value-objects/email'
import { Cpf } from '@/domain/value-objects/cpf'

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

      let emailVO: Email
      let cpfVO: Cpf
      try {
        emailVO = Email.create(email)
        cpfVO = Cpf.create(cpf)
      } catch (voError) {
        return badRequest(voError as Error)
      }

      const userOrError = await this.addUser.add({
        name,
        email: emailVO,
        rg,
        cpf: cpfVO,
        dataNascimento
      })
      if (userOrError instanceof Error) {
        return forbidden(userOrError)
      }
      return ok({
        id: userOrError.id.value,
        name: userOrError.name,
        email: userOrError.email.value,
        rg: userOrError.rg,
        cpf: userOrError.cpf.value,
        dataNascimento: userOrError.dataNascimento
      })
    } catch (error) {
      return serverError(error as Error)
    }
  }
}
