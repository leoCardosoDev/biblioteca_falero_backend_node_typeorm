import { Controller, HttpRequest, HttpResponse } from '@/shared/presentation/protocols'
import { ok, serverError, noContent } from '@/shared/presentation/helpers/http-helper'
import { LoadUsers } from '@/modules/identity/domain/usecases/load-users'
import { UserViewModel } from '@/modules/identity/presentation/view-models/user-view-model'

export class LoadUsersController implements Controller {
  constructor(private readonly loadUsers: LoadUsers) { }

  async handle(_httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      // ...

      const users = await this.loadUsers.load()
      return users.length ? ok(users.map(UserViewModel.toHTTP)) : noContent()
    } catch (error) {
      return serverError(error as Error)
    }
  }
}
