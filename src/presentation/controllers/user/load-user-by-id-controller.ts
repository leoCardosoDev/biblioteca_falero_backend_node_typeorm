import { Controller } from '@/presentation/protocols/controller'
import { HttpRequest, HttpResponse } from '@/presentation/protocols/http'
import { LoadUserById } from '@/domain/usecases/load-user-by-id'
import { ok, notFound, serverError } from '@/presentation/helpers/http-helper'
import { NotFoundError } from '@/presentation/errors/not-found-error'
import { UserMapper } from '@/presentation/dtos/user-mapper'

export class LoadUserByIdController implements Controller {
  constructor(private readonly loadUserById: LoadUserById) { }

  async handle(request: HttpRequest): Promise<HttpResponse> {
    try {
      const { id } = request.params as { id: string }
      const user = await this.loadUserById.load(id)
      if (!user) {
        return notFound(new NotFoundError('User'))
      }
      return ok(UserMapper.toDTO(user))
    } catch (error) {
      return serverError(error as Error)
    }
  }
}
