import { Controller, HttpRequest, HttpResponse, Validation, ok, serverError, badRequest, notFound, UserMapper } from '@/presentation'
import { UpdateUser, NotFoundError, Id, Email, Cpf, Name, Rg, Address, AddressProps } from '@/domain'

export class UpdateUserController implements Controller {
  constructor(
    private readonly validation: Validation,
    private readonly updateUser: UpdateUser
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

      const { id } = requestData as { id: string }
      const body = httpRequest.body as Record<string, unknown>

      let idVO: Id
      try {
        idVO = Id.create(id)
      } catch (e) {
        return badRequest(e as Error)
      }

      const updateData: Parameters<typeof this.updateUser.update>[0] = { id: idVO }

      if (body?.name) {
        const nameVO = Name.create(body.name as string)
        if (nameVO instanceof Error) return badRequest(nameVO)
        updateData.name = nameVO
      }
      if (body?.email) {
        try {
          updateData.email = Email.create(body.email as string)
        } catch (e) {
          return badRequest(e as Error)
        }
      }
      if (body?.rg) {
        const rgVO = Rg.create(body.rg as string)
        if (rgVO instanceof Error) return badRequest(rgVO)
        updateData.rg = rgVO
      }
      if (body?.cpf) {
        try {
          updateData.cpf = Cpf.create(body.cpf as string)
        } catch (e) {
          return badRequest(e as Error)
        }
      }
      if (body?.gender) {
        updateData.gender = body.gender as string
      }
      if (body?.phone) {
        updateData.phone = body.phone as string
      }
      if (body?.address) {
        const addressVO = Address.create(body.address as AddressProps)
        if (addressVO instanceof Error) return badRequest(addressVO)
        updateData.address = addressVO
      }

      const user = await this.updateUser.update(updateData)
      if (!user) {
        return notFound(new NotFoundError('User'))
      }
      return ok(UserMapper.toDTO(user))
    } catch (error) {
      return serverError(error as Error)
    }
  }
}
