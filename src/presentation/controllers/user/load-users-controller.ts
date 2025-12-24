import { Controller } from '@/presentation/protocols/controller'
import { HttpResponse } from '@/presentation/protocols/http'
import { LoadUsers } from '@/domain/usecases/load-users'
import { ok, serverError } from '@/presentation/helpers/http-helper'

export class LoadUsersController implements Controller {
  constructor(private readonly loadUsers: LoadUsers) { }

  async handle(_request: unknown): Promise<HttpResponse> {
    try {
      const users = await this.loadUsers.load()
      return ok(users)
    } catch (error) {
      return serverError(error as Error)
    }
  }
}
