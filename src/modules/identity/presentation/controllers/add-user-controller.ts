import { Controller, HttpRequest, HttpResponse } from '@/shared/presentation/protocols'
import { badRequest, ok, serverError } from '@/shared/presentation/helpers/http-helper'
import { Validation } from '@/shared/presentation/protocols/validation'
import { AddUser, AddUserAddressInput } from '@/modules/identity/application/usecases/add-user'
import { Email } from '@/modules/identity/domain/value-objects/email'
import { Name } from '@/modules/identity/domain/value-objects/name'
import { Cpf } from '@/modules/identity/domain/value-objects/cpf'
import { Rg } from '@/modules/identity/domain/value-objects/rg'
import { UserStatus } from '@/modules/identity/domain/value-objects/user-status'

export class AddUserController implements Controller {
  constructor(
    private readonly validation: Validation,
    private readonly addUser: AddUser
  ) { }

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const error = this.validation.validate(httpRequest.body)
      if (error) {
        return badRequest(error)
      }

      const { name, email, password, cpf, rg, gender, phone, address } = httpRequest.body as {
        name: string
        email: string
        password?: string
        cpf: string
        rg: string
        gender: string
        phone: string
        address?: AddUserAddressInput
      }

      let emailVO: Email
      try {
        emailVO = Email.create(email)
      } catch (emailError) {
        return badRequest(emailError as Error)
      }

      const nameOrError = Name.create(name)
      if (nameOrError instanceof Error) {
        return badRequest(nameOrError)
      }

      let cpfVO: Cpf
      try {
        cpfVO = Cpf.create(cpf)
      } catch (cpfError) {
        return badRequest(cpfError as Error)
      }

      const rgOrError = Rg.create(rg)
      if (rgOrError instanceof Error) {
        return badRequest(rgOrError)
      }

      // 'ACTIVE' is always a valid status, use restore to avoid dead code branch
      const status = UserStatus.restore('ACTIVE')

      const result = await this.addUser.add({
        name: nameOrError,
        email: emailVO,
        password,
        cpf: cpfVO,
        rg: rgOrError,
        gender,
        phone,
        address,
        status
      })

      if (result instanceof Error) {
        return badRequest(result)
      }

      return ok(result)
    } catch (error) {
      return serverError(error as Error)
    }
  }
}
