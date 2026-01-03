import { Controller, HttpResponse, serverError, badRequest, noContent, MissingParamError } from '@/presentation'
import { DeleteUser } from '@/domain'

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
