import { Controller, HttpRequest, HttpResponse, Validation } from '@/presentation/protocols'
import { badRequest, serverError, ok, forbidden } from '@/presentation/helpers'
import { AddUser } from '@/domain/usecases/add-user'
import { Email } from '@/domain/value-objects/email'
import { Cpf } from '@/domain/value-objects/cpf'
import { Name } from '@/domain/value-objects/name'
import { Rg } from '@/domain/value-objects/rg'
import { Address, AddressProps } from '@/domain/value-objects/address'
import { UserStatus } from '@/domain/value-objects/user-status'
import { InvalidParamError } from '@/presentation/errors'

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

      const statusVO = UserStatus.create('ACTIVE') as UserStatus

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
      return ok({
        id: userOrError.id.value,
        name: userOrError.name.value,
        email: userOrError.email.value,
        rg: userOrError.rg.value,
        cpf: userOrError.cpf.value,
        gender: userOrError.gender,
        phone: userOrError.phone,
        status: userOrError.status.value,
        address: userOrError.address ? {
          street: userOrError.address.street,
          number: userOrError.address.number,
          complement: userOrError.address.complement,
          neighborhoodId: userOrError.address.neighborhoodId,
          cityId: userOrError.address.cityId,
          zipCode: userOrError.address.zipCode
        } : undefined
      })
    } catch (error) {
      return serverError(error as Error)
    }
  }
}
