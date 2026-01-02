import { Controller, HttpRequest, HttpResponse, Validation } from '@/presentation/protocols'
import { badRequest, serverError, ok } from '@/presentation/helpers'
import { CreateUserLogin } from '@/domain/usecases/create-user-login'
import { Password, UserRole, UserStatus, Id } from '@/domain/value-objects'
import { InvalidParamError } from '@/presentation/errors'

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

      const { userId, password } = requestData as { userId: string; password: string }

      const passwordOrError = Password.create(password)
      if (passwordOrError.isLeft()) {
        return badRequest(new InvalidParamError('password'))
      }

      let idVO: Id
      try {
        idVO = Id.create(userId)
      } catch (_error) {
        return badRequest(new InvalidParamError('userId'))
      }

      const login = await this.createUserLogin.create({
        userId: idVO,
        password,
        role: UserRole.create('MEMBER') as UserRole,
        status: UserStatus.create('ACTIVE') as UserStatus
      })
      return ok({
        id: login.id.value,
        userId: login.userId.value,
        email: login.email.value
      })
    } catch (error) {
      return serverError(error as Error)
    }
  }
}
