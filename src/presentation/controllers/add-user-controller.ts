import { Controller, HttpRequest, HttpResponse, Validation, badRequest, serverError, ok, forbidden, UserMapper } from '@/presentation'
import { AddUser, AddUserAddressInput } from '@/domain'
import { InvalidAddressError } from '@/domain/errors'

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
      const { name, email, rg, cpf, gender, phone, address } = httpRequest.body as {
        name: string
        email: string
        rg: string
        cpf: string
        gender: string
        phone?: string
        address?: AddUserAddressInput
      }

      const userOrError = await this.addUser.add({
        name,
        email,
        rg,
        cpf,
        gender,
        phone,
        address,
        status: 'INACTIVE'
      })

      if (userOrError instanceof Error) {
        if (userOrError instanceof InvalidAddressError || userOrError.name.startsWith('Invalid') || userOrError.name.includes('Required')) {
          return badRequest(userOrError)
        }
        return forbidden(userOrError)
      }
      return ok(UserMapper.toDTO(userOrError))
    } catch (error) {
      return serverError(error as Error)
    }
  }
}
