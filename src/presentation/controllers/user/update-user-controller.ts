import { Controller } from '@/presentation/protocols/controller'
import { HttpResponse } from '@/presentation/protocols/http'
import { UpdateUser } from '@/domain/usecases/update-user'
import { ok, serverError, badRequest, notFound } from '@/presentation/helpers/http-helper'
import { MissingParamError } from '@/presentation/errors'
import { NotFoundError } from '@/domain/errors'
import { Id } from '@/domain/value-objects/id'
import { Email } from '@/domain/value-objects/email'
import { Cpf } from '@/domain/value-objects/cpf'
import { Name } from '@/domain/value-objects/name'
import { Rg } from '@/domain/value-objects/rg'
import { Address, AddressProps } from '@/domain/value-objects/address'

export class UpdateUserController implements Controller {
  constructor(private readonly updateUser: UpdateUser) { }

  async handle(_request: unknown): Promise<HttpResponse> {
    try {
      const { params, body } = _request as { params?: { id: string }, body?: Record<string, unknown> }
      const { id } = params || {}
      if (!id) {
        return badRequest(new MissingParamError('id'))
      }

      let idVO: Id
      try {
        idVO = Id.create(id)
      } catch (e) {
        return badRequest(e as Error)
      }

      const updateData: Parameters<typeof this.updateUser.update>[0] = { id: idVO }

      if (body?.name) {
        const nameVO = Name.create(body.name as string)
        if (nameVO instanceof Error) return badRequest(nameVO)
        updateData.name = nameVO
      }
      if (body?.email) {
        try {
          updateData.email = Email.create(body.email as string)
        } catch (e) {
          return badRequest(e as Error)
        }
      }
      if (body?.rg) {
        const rgVO = Rg.create(body.rg as string)
        if (rgVO instanceof Error) return badRequest(rgVO)
        updateData.rg = rgVO
      }
      if (body?.cpf) {
        try {
          updateData.cpf = Cpf.create(body.cpf as string)
        } catch (e) {
          return badRequest(e as Error)
        }
      }
      if (body?.gender) {
        updateData.gender = body.gender as string
      }
      if (body?.phone) {
        updateData.phone = body.phone as string
      }
      if (body?.address) {
        const addressVO = Address.create(body.address as AddressProps)
        if (addressVO instanceof Error) return badRequest(addressVO)
        updateData.address = addressVO
      }

      const user = await this.updateUser.update(updateData)
      if (!user) {
        return notFound(new NotFoundError('User'))
      }
      return ok({
        id: user.id.value,
        name: user.name.value,
        email: user.email.value,
        rg: user.rg.value,
        cpf: user.cpf.value,
        gender: user.gender,
        phone: user.phone,
        address: user.address ? {
          street: user.address.street,
          number: user.address.number,
          complement: user.address.complement,
          neighborhoodId: user.address.neighborhoodId,
          cityId: user.address.cityId,
          zipCode: user.address.zipCode
        } : undefined
      })
    } catch (error) {
      return serverError(error as Error)
    }
  }
}
