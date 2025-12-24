import { Controller } from '@/presentation/protocols/controller'
import { HttpResponse } from '@/presentation/protocols/http'
import { UpdateUser } from '@/domain/usecases/update-user'
import { ok, serverError, badRequest } from '@/presentation/helpers/http-helper'
import { MissingParamError } from '@/presentation/errors'

export class UpdateUserController implements Controller {
  constructor(private readonly updateUser: UpdateUser) { }

  async handle(_request: unknown): Promise<HttpResponse> {
    try {
      const { params, body } = _request as { params?: { id: string }, body?: unknown }
      const { id } = params || {}
      if (!id) {
        return badRequest(new MissingParamError('id'))
      }
      const userData = { ...(body as object), id }
      const user = await this.updateUser.update(userData)
      return ok(user)
    } catch (error) {
      return serverError(error as Error)
    }
  }
}
