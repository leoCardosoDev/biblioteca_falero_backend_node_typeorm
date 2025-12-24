import { Controller } from '@/presentation/protocols/controller'
import { HttpResponse } from '@/presentation/protocols/http'
import { DeleteUser } from '@/domain/usecases/delete-user'
import { serverError, badRequest, noContent } from '@/presentation/helpers/http-helper'
import { MissingParamError } from '@/presentation/errors'

export class DeleteUserController implements Controller {
  constructor(private readonly deleteUser: DeleteUser) { }

  async handle(_request: unknown): Promise<HttpResponse> {
    try {
      const { params } = _request as { params?: { id: string } }
      const { id } = params || {}
      if (!id) {
        return badRequest(new MissingParamError('id'))
      }
      await this.deleteUser.delete(id)
      return noContent()
    } catch (error) {
      return serverError(error as Error)
    }
  }
}
