import { Controller, HttpRequest, HttpResponse } from '@/shared/presentation/protocols'
import { ok, serverError, badRequest } from '@/shared/presentation/helpers/http-helper'
import { LoadStateById } from '@/modules/geography/domain/usecases/load-state-by-id'

export class LoadStateByIdController implements Controller {
  constructor(private readonly loadStateById: LoadStateById) { }

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { id } = httpRequest.params as { id: string }
      const state = await this.loadStateById.load(id)
      if (!state) {
        return badRequest(new Error('State not found'))
      }
      return ok(state)
    } catch (error) {
      return serverError(error as Error)
    }
  }
}
