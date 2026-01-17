import { Controller, HttpRequest, HttpResponse } from '@/shared/presentation/protocols'
import { noContent, serverError, badRequest } from '@/shared/presentation/helpers/http-helper'
import { DeleteUser } from '@/modules/identity/domain/usecases/delete-user'
import { MissingParamError } from '@/shared/presentation/errors/missing-param-error'

export class DeleteUserController implements Controller {
  constructor(private readonly deleteUser: DeleteUser) { }

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const params = (httpRequest.params || {}) as { id?: string }
      const id = params.id
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
