import { Controller, HttpRequest, HttpResponse, Validation } from '@/presentation/protocols'
import { badRequest, serverError, ok, forbidden } from '@/presentation/helpers'
import { AddUser } from '@/domain/usecases/add-user'
import { Email } from '@/domain/value-objects/email'
import { Cpf } from '@/domain/value-objects/cpf'
import { Name } from '@/domain/value-objects/name'
import { Rg } from '@/domain/value-objects/rg'
import { BirthDate } from '@/domain/value-objects/birth-date'
import { Address, AddressProps } from '@/domain/value-objects/address'

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
      const { name, email, rg, cpf, birthDate, address } = httpRequest.body as {
        name: string
        email: string
        rg: string
        cpf: string
        birthDate: string
        address?: AddressProps
      }

      const nameVO = Name.create(name)
      if (nameVO instanceof Error) return badRequest(nameVO)

      let emailVO: Email
      try {
        emailVO = Email.create(email)
      } catch (e) {
        return badRequest(e as Error)
      }

      const rgVO = Rg.create(rg)
      if (rgVO instanceof Error) return badRequest(rgVO)

      let cpfVO: Cpf
      try {
        cpfVO = Cpf.create(cpf)
      } catch (e) {
        return badRequest(e as Error)
      }

      const birthDateVO = BirthDate.create(birthDate)
      if (birthDateVO instanceof Error) return badRequest(birthDateVO)

      let addressVO: Address | undefined
      if (address) {
        const addressResult = Address.create(address)
        if (addressResult instanceof Error) return badRequest(addressResult)
        addressVO = addressResult
      }

      const userOrError = await this.addUser.add({
        name: nameVO,
        email: emailVO,
        rg: rgVO,
        cpf: cpfVO,
        birthDate: birthDateVO,
        address: addressVO
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
        birthDate: userOrError.birthDate.value,
        address: userOrError.address ? {
          street: userOrError.address.street,
          number: userOrError.address.number,
          complement: userOrError.address.complement,
          neighborhood: userOrError.address.neighborhood,
          city: userOrError.address.city,
          state: userOrError.address.state,
          zipCode: userOrError.address.zipCode
        } : undefined
      })
    } catch (error) {
      return serverError(error as Error)
    }
  }
}
