import { Controller, HttpResponse, ok, serverError } from '@/presentation'
import { LoadUsers } from '@/domain'

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
        status: user.status.value,
        version: user.version,
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
