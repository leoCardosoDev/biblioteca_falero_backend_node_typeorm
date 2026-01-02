import { Controller } from '@/presentation/protocols/controller'
import { HttpRequest, HttpResponse } from '@/presentation/protocols/http'
import { AddUserLogin } from '@/domain/usecases/add-user-login'
import { Validation } from '@/presentation/protocols/validation'
import { badRequest, ok, serverError } from '@/presentation/helpers/http-helper'
import { Id } from '@/domain/value-objects/id'
import { UserRole } from '@/domain/value-objects/user-role'
import { UserStatus } from '@/domain/value-objects/user-status'
import { Email } from '@/domain/value-objects/email'
import { InvalidParamError } from '@/presentation/errors'

export class AddUserLoginController implements Controller {
  constructor(
    private readonly addUserLogin: AddUserLogin,
    private readonly validation: Validation
  ) { }

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const error = this.validation.validate(httpRequest.body as Record<string, unknown>)
      if (error) {
        return badRequest(error)
      }

      const { id } = httpRequest.params as { id: string }
      const { email, password, role, status } = httpRequest.body as { email: string, password: string, role: string, status: string }

      let userIdOrError: Id
      try {
        userIdOrError = Id.create(id)
      } catch (_error) {
        return badRequest(new InvalidParamError('id'))
      }

      const roleOrError = UserRole.create(role)
      if (roleOrError instanceof Error) {
        return badRequest(new InvalidParamError('role'))
      }

      const statusOrError = UserStatus.create(status)
      if (statusOrError instanceof Error) {
        return badRequest(new InvalidParamError('status'))
      }

      let emailVO: Email
      try {
        emailVO = Email.create(email)
      } catch (_error) {
        return badRequest(new InvalidParamError('email'))
      }

      const login = await this.addUserLogin.add({
        userId: userIdOrError,
        email: emailVO,
        password,
        role: roleOrError,
        status: statusOrError
      })

      return ok({
        id: login.id.value,
        userId: login.userId.value,
        roleId: login.roleId.value,
        status: login.isActive ? 'ACTIVE' : 'INACTIVE'
      })
    } catch (error) {
      return serverError(error as Error)
    }
  }
}
