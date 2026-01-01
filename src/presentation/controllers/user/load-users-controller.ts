import { Controller } from '@/presentation/protocols/controller'
import { HttpResponse } from '@/presentation/protocols/http'
import { LoadUsers } from '@/domain/usecases/load-users'
import { ok, serverError } from '@/presentation/helpers/http-helper'

export class LoadUsersController implements Controller {
  constructor(private readonly loadUsers: LoadUsers) { }

  async handle(_request: unknown): Promise<HttpResponse> {
    try {
      const users = await this.loadUsers.load()
      const serializedUsers = users.map(user => ({
        id: user.id.value,
        name: user.name.value,
        email: user.email.value,
        rg: user.rg.value,
        cpf: user.cpf.value,
        gender: user.gender,
        phone: user.phone,
        address: user.address ? {
          street: user.address.street,
          number: user.address.number,
          complement: user.address.complement,
          neighborhoodId: user.address.neighborhoodId,
          cityId: user.address.cityId,
          zipCode: user.address.zipCode
        } : undefined,
        login: user.login ? {
          role: user.login.role.value,
          status: user.login.status.value
        } : null
      }))
      return ok(serializedUsers)
    } catch (error) {
      return serverError(error as Error)
    }
  }
}
