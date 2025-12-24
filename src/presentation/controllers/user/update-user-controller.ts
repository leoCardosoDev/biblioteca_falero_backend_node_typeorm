import { Controller } from '@/presentation/protocols/controller'
import { HttpResponse } from '@/presentation/protocols/http'
import { UpdateUser } from '@/domain/usecases/update-user'
import { ok, serverError, badRequest } from '@/presentation/helpers/http-helper'
import { MissingParamError } from '@/presentation/errors'
import { Id } from '@/domain/value-objects/id'
import { Email } from '@/domain/value-objects/email'
import { Cpf } from '@/domain/value-objects/cpf'

export class UpdateUserController implements Controller {
  constructor(private readonly updateUser: UpdateUser) { }

  async handle(_request: unknown): Promise<HttpResponse> {
    try {
      const { params, body } = _request as { params?: { id: string }, body?: Record<string, string> }
      const { id } = params || {}
      if (!id) {
        return badRequest(new MissingParamError('id'))
      }

      let idVO: Id
      try {
        idVO = Id.create(id)
      } catch (voError) {
        return badRequest(voError as Error)
      }

      const updateData: Parameters<typeof this.updateUser.update>[0] = { id: idVO }
      if (body?.name) updateData.name = body.name
      if (body?.email) {
        try {
          updateData.email = Email.create(body.email)
        } catch (e) {
          return badRequest(e as Error)
        }
      }
      if (body?.rg) updateData.rg = body.rg
      if (body?.cpf) {
        try {
          updateData.cpf = Cpf.create(body.cpf)
        } catch (e) {
          return badRequest(e as Error)
        }
      }
      if (body?.dataNascimento) updateData.dataNascimento = body.dataNascimento

      const user = await this.updateUser.update(updateData)
      return ok({
        id: user.id.value,
        name: user.name,
        email: user.email.value,
        rg: user.rg,
        cpf: user.cpf.value,
        dataNascimento: user.dataNascimento
      })
    } catch (error) {
      return serverError(error as Error)
    }
  }
}
