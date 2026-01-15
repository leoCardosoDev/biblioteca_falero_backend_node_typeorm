
import { ManageUserAccess } from '@/domain/usecases'
import { UserStatus } from '@/domain/value-objects'
import { Controller } from '@/presentation/protocols/controller'
import { HttpResponse, HttpRequest } from '@/presentation/protocols/http'
import { badRequest, forbidden, noContent, notFound, serverError } from '@/presentation/helpers'
import { AccessDeniedError, NotFoundError } from '@/domain/errors'

export class ManageUserAccessController implements Controller {
  constructor(private readonly manageUserAccess: ManageUserAccess) { }

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
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

