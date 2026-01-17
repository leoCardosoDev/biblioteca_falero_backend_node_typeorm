import { Controller, HttpRequest, HttpResponse } from '@/shared/presentation/protocols'
import { badRequest, noContent, serverError, forbidden, notFound } from '@/shared/presentation/helpers/http-helper'
import { Validation } from '@/shared/presentation/protocols/validation'
import { ManageUserAccess } from '@/modules/identity/application/usecases/manage-user-access'
import { UserStatus } from '@/modules/identity/domain/value-objects/user-status'
import { AccessDeniedError } from '@/shared/domain/errors/access-denied-error'
import { NotFoundError } from '@/shared/domain/errors/not-found-error'

export class ManageUserAccessController implements Controller {
  constructor(
    private readonly validation: Validation,
    private readonly manageUserAccess: ManageUserAccess
  ) { }

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const error = this.validation.validate(httpRequest.body)
      if (error) {
        return badRequest(error)
      }

      const { id } = httpRequest.params as { id: string }
      const { role, roleSlug, status, password } = httpRequest.body as {
        role?: string
        roleSlug?: string
        status?: string
        password?: string
      }
      const effectiveRoleSlug = roleSlug ?? role

      const actorId = httpRequest.userId
      if (!actorId) return forbidden(new AccessDeniedError())

      let userStatus: UserStatus | undefined
      if (status) {
        const statusOrError = UserStatus.create(status)
        if (statusOrError instanceof Error) {
          return badRequest(statusOrError)
        }
        userStatus = statusOrError
      }

      const result = await this.manageUserAccess.perform({
        actorId,
        targetId: id,
        roleSlug: effectiveRoleSlug,
        status: userStatus,
        password
      })

      if (result.isLeft()) {
        const err = result.value
        if (err instanceof AccessDeniedError) {
          return forbidden(err)
        }
        if (err instanceof NotFoundError) {
          return notFound(err)
        }
        return badRequest(err)
      }
      return noContent()
    } catch (error) {
      return serverError(error as Error)
    }
  }
}
