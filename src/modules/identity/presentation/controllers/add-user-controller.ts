import { Controller, HttpRequest, HttpResponse } from '@/shared/presentation/protocols'
import { badRequest, ok, serverError } from '@/shared/presentation/helpers/http-helper'
import { Validation } from '@/shared/presentation/protocols/validation'
import { AddUser, AddUserAddressInput } from '@/modules/identity/application/usecases/add-user'

export class AddUserController implements Controller {
  constructor(
    private readonly validation: Validation,
    private readonly addUser: AddUser
  ) { }

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const error = this.validation.validate(httpRequest.body)
      if (error) {
        return badRequest(error)
      }

      const { name, email, password, cpf, rg, gender, phone, address } = httpRequest.body as {
        name: string
        email: string
        password?: string
        cpf: string
        rg: string
        gender: string
        phone: string
        address?: AddUserAddressInput
      }

      const result = await this.addUser.add({
        name,
        email,
        password,
        cpf,
        rg,
        gender,
        phone,
        address,
        status: 'ACTIVE'
      })

      if (result instanceof Error) {
        return badRequest(result)
      }

      return ok(result)
    } catch (error) {
      return serverError(error as Error)
    }
  }
}
