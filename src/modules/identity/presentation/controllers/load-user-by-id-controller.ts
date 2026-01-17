import { Controller, HttpRequest, HttpResponse } from '@/shared/presentation/protocols'
import { LoadUserById } from '@/modules/identity/application/usecases/load-user-by-id'
import { NotFoundError } from '@/shared/domain/errors/not-found-error'
import { ok, notFound, serverError } from '@/shared/presentation/helpers/http-helper'
import { UserViewModel } from '@/modules/identity/presentation/view-models/user-view-model'

export class LoadUserByIdController implements Controller {
  constructor(private readonly loadUserById: LoadUserById) { }

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { id } = httpRequest.params as { id: string }
      const user = await this.loadUserById.load(id)
      if (!user) {
        return notFound(new NotFoundError('User not found'))
      }
      return ok(UserViewModel.toHTTP(user))
    } catch (error) {
      return serverError(error as Error)
    }
  }
}
