import { Controller, HttpRequest, HttpResponse, Validation } from '@/presentation/protocols'
import { badRequest, serverError, ok } from '@/presentation/helpers'
import { CreateUserLogin, CreateUserLoginParams } from '@/domain/usecases/create-user-login'
import { Password } from '@/domain/value-objects/password'

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
      const passwordVO = Password.create(password)
      if (passwordVO instanceof Error) {
        return badRequest(passwordVO)
      }

      const login = await this.createUserLogin.create({ userId, password } as CreateUserLoginParams)
      return ok(login)
    } catch (error) {
      return serverError(error as Error)
    }
  }
}
