import { Controller } from '@/presentation/protocols/controller'
import { HttpRequest, HttpResponse } from '@/presentation/protocols/http'
import { LoadUserById } from '@/domain/usecases/load-user-by-id'
import { ok, notFound, serverError } from '@/presentation/helpers/http-helper'

import { NotFoundError } from '@/presentation/errors/not-found-error'

export class LoadUserByIdController implements Controller {
  constructor(private readonly loadUserById: LoadUserById) { }

  async handle(request: HttpRequest): Promise<HttpResponse> {
    try {
      const { id } = request.params as { id: string }
      const user = await this.loadUserById.load(id)
      if (!user) {
        return notFound(new NotFoundError('User'))
      }
      const serializedUser = {
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
      }

      return ok(serializedUser)
    } catch (error) {
      return serverError(error as Error)
    }
  }
}
