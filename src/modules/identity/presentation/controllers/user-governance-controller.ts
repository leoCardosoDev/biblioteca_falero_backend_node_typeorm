import { Controller, HttpRequest, HttpResponse } from '@/shared/presentation/protocols'
import { badRequest, noContent, serverError, forbidden } from '@/shared/presentation/helpers/http-helper'
import { Validation } from '@/shared/presentation/protocols/validation'
import { BlockUser } from '@/modules/identity/domain/usecases/block-user'
import { PromoteUser } from '@/modules/identity/domain/usecases/promote-user'
import { AccessDeniedError } from '@/shared/domain/errors/access-denied-error'

export class UpdateUserStatusController implements Controller {
  constructor(
    private readonly validation: Validation,
    private readonly blockUser: BlockUser
  ) { }

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const error = this.validation.validate(httpRequest.body)
      if (error) {
        return badRequest(error)
      }
      const { id } = httpRequest.params as { id: string }

      const actorId = httpRequest.userId
      if (!actorId) return forbidden(new AccessDeniedError())

      const result = await this.blockUser.block(actorId, id)
      if (result.isLeft()) {
        const error = result.value
        if (error instanceof AccessDeniedError) {
          return forbidden(error)
        }
        return badRequest(error)
      }
      return noContent()
    } catch (error) {
      return serverError(error as Error)
    }
  }
}

export class UpdateUserRoleController implements Controller {
  constructor(
    private readonly validation: Validation,
    private readonly promoteUser: PromoteUser
  ) { }

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const error = this.validation.validate(httpRequest.body)
      if (error) {
        return badRequest(error)
      }
      const { id } = httpRequest.params as { id: string }
      const { roleId } = httpRequest.body as { roleId: string }

      const actorId = httpRequest.userId
      if (!actorId) return forbidden(new AccessDeniedError())

      const result = await this.promoteUser.promote(actorId, id, roleId)
      if (result.isLeft()) {
        const error = result.value
        if (error instanceof AccessDeniedError) {
          return forbidden(error)
        }
        return badRequest(error)
      }
      return noContent()
    } catch (error) {
      return serverError(error as Error)
    }
  }
}
