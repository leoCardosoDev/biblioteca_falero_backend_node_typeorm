import { Controller, HttpRequest, HttpResponse } from '@/shared/presentation/protocols'
import { badRequest, ok, serverError, notFound } from '@/shared/presentation/helpers/http-helper'
import { Validation } from '@/shared/presentation/protocols/validation'
import { UpdateUser } from '@/modules/identity/domain/usecases/update-user'
import { NotFoundError } from '@/shared/domain/errors/not-found-error'
import { UserViewModel } from '@/modules/identity/presentation/view-models/user-view-model'
import { AccessDeniedError } from '@/shared/domain/errors/access-denied-error'
import { Id } from '@/shared/domain/value-objects/id'
import { Email } from '@/modules/identity/domain/value-objects/email'
import { Name } from '@/modules/identity/domain/value-objects/name'
import { Rg } from '@/modules/identity/domain/value-objects/rg'
import { Cpf } from '@/modules/identity/domain/value-objects/cpf'
import { Address } from '@/modules/identity/domain/value-objects/address'
import { UserStatus } from '@/modules/identity/domain/value-objects/user-status'
import { forbidden } from '@/shared/presentation/helpers/http-helper'

export class UpdateUserController implements Controller {
  constructor(
    private readonly validation: Validation,
    private readonly updateUser: UpdateUser
  ) { }

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const params = (httpRequest.params || {}) as { id?: string }
      const id = params.id as string
      const error = this.validation.validate({ ...httpRequest.body, id })
      if (error) {
        return badRequest(error)
      }
      const { name, email, status, rg, cpf, address, gender, phone } = httpRequest.body as {
        name?: string
        email?: string
        status?: string
        rg?: string
        cpf?: string
        gender?: string
        phone?: string
        address?: {
          street: string
          number: string
          complement?: string
          zipCode: string
          neighborhoodId: string
          cityId: string
          stateId: string
          neighborhood?: string
          city?: string
          state?: string
        }
      }

      let idVO: Id
      let nameVO: Name | undefined
      let emailVO: Email | undefined
      let statusVO: UserStatus | undefined
      let rgVO: Rg | undefined
      let cpfVO: Cpf | undefined
      let addressVO: Address | undefined

      try {
        idVO = Id.create(id)

        if (name) {
          const nameOrError = Name.create(name)
          if (nameOrError instanceof Error) return badRequest(nameOrError)
          nameVO = nameOrError
        }

        if (email) {
          emailVO = Email.create(email)
        }

        if (status) {
          const statusOrError = UserStatus.create(status)
          if (statusOrError instanceof Error) return badRequest(statusOrError)
          statusVO = statusOrError
        }

        if (rg) {
          const rgOrError = Rg.create(rg)
          if (rgOrError instanceof Error) return badRequest(rgOrError)
          rgVO = rgOrError
        }

        if (cpf) {
          const cpfOrError = Cpf.create(cpf)
          if (cpfOrError instanceof Error) return badRequest(cpfOrError)
          cpfVO = cpfOrError
        }

        if (address) {
          const neighborhoodIdVO = Id.create(address.neighborhoodId)
          const cityIdVO = Id.create(address.cityId)
          const stateIdVO = Id.create(address.stateId)

          const addressOrError = Address.create({
            street: address.street,
            number: address.number,
            complement: address.complement,
            zipCode: address.zipCode,
            neighborhoodId: neighborhoodIdVO,
            cityId: cityIdVO,
            stateId: stateIdVO,
            neighborhood: address.neighborhood,
            city: address.city,
            state: address.state
          })
          if (addressOrError instanceof Error) return badRequest(addressOrError)
          addressVO = addressOrError
        }
      } catch (err) {
        return badRequest(err as Error)
      }

      const result = await this.updateUser.update({
        id: idVO,
        name: nameVO,
        email: emailVO,
        status: statusVO,
        rg: rgVO,
        cpf: cpfVO,
        address: addressVO,
        gender,
        phone
      })

      if (result instanceof Error) {
        if (result.name === 'NotFoundError') {
          return forbidden(new AccessDeniedError())
        }
        return badRequest(result)
      }

      if (!result) {
        return notFound(new NotFoundError('User not found'))
      }

      return ok(UserViewModel.toHTTP(result))
    } catch (error) {
      return serverError(error as Error)
    }
  }
}
