import { Controller } from '@/presentation/protocols/controller'
import { HttpRequest, HttpResponse } from '@/presentation/protocols/http'
import { AddUserLogin } from '@/domain/usecases/add-user-login'
import { Validation } from '@/presentation/protocols/validation'
import { badRequest, ok, serverError } from '@/presentation/helpers/http-helper'
import { Id } from '@/domain/value-objects/id'
import { UserRole } from '@/domain/value-objects/user-role'
import { UserStatus } from '@/domain/value-objects/user-status'
import { Email } from '@/domain/value-objects/email'

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
      } catch (error) {
        return badRequest(error as Error)
      }

      const roleOrError = UserRole.create(role)
      if (roleOrError instanceof Error) {
        return badRequest(roleOrError)
      }

      const statusOrError = UserStatus.create(status)
      if (statusOrError instanceof Error) {
        return badRequest(statusOrError)
      }

      const emailOrError = Email.create(email)
      if (emailOrError instanceof Error) {
        return badRequest(emailOrError)
      }

      const login = await this.addUserLogin.add({
        userId: userIdOrError,
        email: emailOrError,
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
