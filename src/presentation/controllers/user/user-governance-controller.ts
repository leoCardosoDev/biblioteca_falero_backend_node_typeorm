import { Controller, HttpRequest, HttpResponse, Validation, badRequest, noContent, serverError, forbidden, InvalidParamError, MissingParamError } from '@/presentation'
import { BlockUser, PromoteUser, AccessDeniedError } from '@/domain'

export class UpdateUserStatusController implements Controller {
  constructor(
    private readonly validation: Validation,
    private readonly blockUser: BlockUser
  ) { }

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const error = this.validation.validate(httpRequest.body as Record<string, unknown>)
      if (error) {
        return badRequest(error)
      }
      const body = httpRequest.body as { status?: string, roleId?: string }
      const { status } = body
      const { id } = httpRequest.params as { id: string }
      const actorId = httpRequest.userId as string

      if (!status) {
        return badRequest(new MissingParamError('status'))
      }

      if (status !== 'BLOCKED') {
        return badRequest(new InvalidParamError('status'))
      }

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
      const error = this.validation.validate(httpRequest.body as Record<string, unknown>)
      if (error) {
        return badRequest(error)
      }
      const body = httpRequest.body as { roleId?: string }
      const { roleId } = body
      const { id } = httpRequest.params as { id: string }
      const actorId = httpRequest.userId as string

      if (!roleId) {
        return badRequest(new MissingParamError('roleId'))
      }

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
