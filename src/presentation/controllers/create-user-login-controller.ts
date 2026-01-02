import { Controller, HttpRequest, HttpResponse, Validation } from '@/presentation/protocols'
import { badRequest, serverError, ok } from '@/presentation/helpers'
import { CreateUserLogin } from '@/domain/usecases/create-user-login'
import { Password } from '@/domain/value-objects/password'
import { UserRole } from '@/domain/value-objects/user-role'
import { UserStatus } from '@/domain/value-objects/user-status'
import { Id } from '@/domain/value-objects/id'
import { Email } from '@/domain/value-objects/email'

export class CreateUserLoginController implements Controller {
  constructor(
    private readonly validation: Validation,
    private readonly createUserLogin: CreateUserLogin
  ) { }

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const requestData = {
        ...(httpRequest.body as Record<string, unknown>),
        ...(httpRequest.params as Record<string, unknown>)
      }
      const error = this.validation.validate(requestData)
      if (error) {
        return badRequest(error)
      }

      const { userId, password, email } = requestData as { userId: string; password: string; email: string }
      let emailVO: Email
      try {
        emailVO = Email.create(email)
      } catch (error) {
        return badRequest(error as Error)
      }

      const passwordOrError = Password.create(password)
      if (passwordOrError.isLeft()) {
        return badRequest(passwordOrError.value)
      }
      const passwordVO = passwordOrError.value

      let idVO: Id
      try {
        idVO = Id.create(userId)
      } catch (error) {
        return badRequest(error as Error)
      }

      const login = await this.createUserLogin.create({
        userId: idVO,
        email: emailVO as Email,
        password,
        role: UserRole.create('MEMBER') as UserRole,
        status: UserStatus.create('ACTIVE') as UserStatus
      })
      return ok(login)
    } catch (error) {
      console.error('CreateUserLoginController Error:', error)
      return serverError(error as Error)
    }
  }
}
