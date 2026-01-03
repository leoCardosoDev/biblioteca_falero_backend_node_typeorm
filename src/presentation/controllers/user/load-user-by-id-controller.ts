import { Controller, HttpRequest, HttpResponse, ok, notFound, serverError, NotFoundError, UserMapper } from '@/presentation'
import { LoadUserById } from '@/domain'

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
