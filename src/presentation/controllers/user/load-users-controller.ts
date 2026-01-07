import { Controller, HttpResponse, ok, serverError, UserMapper } from '@/presentation'
import { LoadUsers } from '@/domain'

export class LoadUsersController implements Controller {
  constructor(private readonly loadUsers: LoadUsers) { }

  async handle(_request: unknown): Promise<HttpResponse> {

    try {
      const users = await this.loadUsers.load()
      const serializedUsers = users.map(UserMapper.toDTO)
      return ok(serializedUsers)
    } catch (error) {

      return serverError(error as Error)
    }
  }
}
