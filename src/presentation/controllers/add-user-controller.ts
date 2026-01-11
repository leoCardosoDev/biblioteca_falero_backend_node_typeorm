import { Controller, HttpRequest, HttpResponse, Validation, badRequest, serverError, ok, forbidden } from '@/presentation'
import { AddUser, AddUserAddressInput, InvalidAddressError } from '@/domain'

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
      const { name, email, rg, cpf, gender, phone, address, status } = httpRequest.body as {
        name: string
        email: string
        rg: string
        cpf: string
        gender: string
        phone?: string
        address?: AddUserAddressInput
        status: string
      }

      const userOrError = await this.addUser.add({
        name, email, rg, cpf, gender, phone, address, status
      })

      if (userOrError instanceof Error) {
        if (userOrError instanceof InvalidAddressError || userOrError.name.startsWith('Invalid') || userOrError.name.includes('Required')) {
          return badRequest(userOrError)
        }
        return forbidden(userOrError)
      }
      return ok(userOrError)
    } catch (error) {
      if (error instanceof Error) {
        console.error('STACK:', error.stack)
      }
      return serverError(error as Error)
    }
  }
}
