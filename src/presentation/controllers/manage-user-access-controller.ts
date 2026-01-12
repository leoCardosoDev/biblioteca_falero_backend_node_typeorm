
import { ManageUserAccess } from '@/domain/usecases/manage-user-access'
import { UserStatus } from '@/domain/value-objects/user-status'
import { Controller } from '@/presentation/protocols/controller'
import { HttpResponse, HttpRequest } from '@/presentation/protocols/http'
import { badRequest, forbidden, noContent, notFound, serverError } from '@/presentation/helpers/http-helper'
import { AccessDeniedError } from '@/domain/errors/access-denied-error'
import { NotFoundError } from '@/domain/errors/not-found-error'

export class ManageUserAccessController implements Controller {
  constructor(private readonly manageUserAccess: ManageUserAccess) { }

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      console.log('ManageUserAccessController payload:', httpRequest.body)
      const { role, status, password } = httpRequest.body as { role?: string, status?: string, password?: string }
      const params = httpRequest.params as { id: string }
      const id = params.id

      let userStatus: UserStatus | undefined
      if (status) {
        const resultOrError = UserStatus.create(status)
        if (resultOrError instanceof Error) {
          return badRequest(resultOrError)
        }
        userStatus = resultOrError
      }

      const result = await this.manageUserAccess.perform({
        actorId: httpRequest.userId!,
        targetId: id,
        roleSlug: role,
        status: userStatus,
        password
      })

      if (result.isLeft()) {
        const error = result.value
        switch (error.constructor) {
          case AccessDeniedError:
            return forbidden(error)
          case NotFoundError:
            return notFound(error)
          default:
            return badRequest(error)
        }
      }

      return noContent()
    } catch (error) {
      return serverError(error as Error)
    }
  }
}

