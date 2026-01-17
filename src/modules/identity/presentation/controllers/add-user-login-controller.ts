import { Controller, HttpRequest, HttpResponse } from '@/shared/presentation/protocols'
import { badRequest, ok, serverError, forbidden } from '@/shared/presentation/helpers/http-helper'
import { Validation } from '@/shared/presentation/protocols/validation'
import { AddUserLogin } from '@/modules/identity/application/usecases/add-user-login'
import { LoginViewModel } from '@/modules/identity/presentation/view-models/login-view-model'

import { Id } from '@/shared/domain/value-objects/id'
import { Email } from '@/modules/identity/domain/value-objects/email'
import { Password } from '@/modules/identity/domain/value-objects/password'
import { UserRole } from '@/modules/identity/domain/value-objects/user-role'
import { UserStatus } from '@/modules/identity/domain/value-objects/user-status'

export class AddUserLoginController implements Controller {
  constructor(
    private readonly addUserLogin: AddUserLogin,
    private readonly validation: Validation
  ) { }

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const params = (httpRequest.params || {}) as { userId?: string }
      const userId = params.userId as string
      const body = httpRequest.body as Record<string, unknown>
      const error = this.validation.validate({ ...body, userId })
      if (error) {
        return badRequest(error)
      }

      const { email, password, role, status } = body as {
        email: string
        password: string
        role?: string
        status?: string
      }
      const actorId = httpRequest.userId

      if (!actorId) return forbidden(new Error('Missing actor'))

      // VO Instantiation
      let actorIdVO: Id
      let userIdVO: Id
      let emailVO: Email
      let passwordVO: Password
      let roleVO: UserRole | undefined = undefined
      let statusVO: UserStatus | undefined = undefined

      try {
        actorIdVO = Id.create(actorId)
        userIdVO = Id.create(userId)
        emailVO = Email.create(email)

        const passwordOrError = Password.create(password)
        if (passwordOrError.isLeft()) {
          return badRequest(passwordOrError.value)
        }
        passwordVO = passwordOrError.value

        if (role) {
          const roleOrError = UserRole.create(role)
          if (roleOrError instanceof Error) return badRequest(roleOrError)
          roleVO = roleOrError
        }
        if (status) {
          const statusOrError = UserStatus.create(status)
          if (statusOrError instanceof Error) return badRequest(statusOrError)
          statusVO = statusOrError
        }
      } catch (err) {
        return badRequest(err as Error)
      }

      const result = await this.addUserLogin.add({
        actorId: actorIdVO,
        userId: userIdVO,
        email: emailVO,
        password: passwordVO,
        role: roleVO,
        status: statusVO
      })

      if (result instanceof Error) {
        return badRequest(result)
      }

      return ok(LoginViewModel.toHTTP(result))
    } catch (error) {
      return serverError(error as Error)
    }
  }
}
