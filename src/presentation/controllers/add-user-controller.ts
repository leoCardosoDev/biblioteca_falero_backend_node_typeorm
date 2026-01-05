import { Controller, HttpRequest, HttpResponse, Validation, badRequest, serverError, ok, forbidden, InvalidParamError, UserMapper } from '@/presentation'
import { AddUser, Email, Cpf, Name, Rg, Address, AddressProps, UserStatus } from '@/domain'

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
        address?: AddressProps
      }

      const nameVO = Name.create(name)
      if (nameVO instanceof Error) return badRequest(new InvalidParamError('name'))

      let emailVO: Email
      try {
        emailVO = Email.create(email)
      } catch (_error) {
        return badRequest(new InvalidParamError('email'))
      }

      const rgVO = Rg.create(rg)
      if (rgVO instanceof Error) return badRequest(new InvalidParamError('rg'))

      let cpfVO: Cpf
      try {
        cpfVO = Cpf.create(cpf)
      } catch (_error) {
        return badRequest(new InvalidParamError('cpf'))
      }

      let addressVO: Address | undefined
      if (address) {
        const addressResult = Address.create(address)
        if (addressResult instanceof Error) return badRequest(new InvalidParamError('address'))
        addressVO = addressResult
      }

      const statusVO = UserStatus.create('INACTIVE') as UserStatus

      const userOrError = await this.addUser.add({
        name: nameVO,
        email: emailVO,
        rg: rgVO as Rg,
        cpf: cpfVO,
        gender,
        phone,
        address: addressVO,
        status: statusVO
      })
      if (userOrError instanceof Error) {
        return forbidden(userOrError)
      }
      return ok(UserMapper.toDTO(userOrError))
    } catch (error) {
      return serverError(error as Error)
    }
  }
}
