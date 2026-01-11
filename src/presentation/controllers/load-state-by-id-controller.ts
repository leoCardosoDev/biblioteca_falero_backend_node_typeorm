import { Controller } from '@/presentation/protocols/controller'
import { HttpRequest, HttpResponse } from '@/presentation/protocols/http'
import { LoadStateById } from '@/domain/usecases/load-state-by-id'
import { ok, serverError, noContent } from '@/presentation/helpers/http-helper'

export class LoadStateByIdController implements Controller {
  constructor(private readonly loadStateById: LoadStateById) { }

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { id } = httpRequest.params as { id: string }
      const state = await this.loadStateById.load(id)
      if (!state) {
        return noContent()
      }
      return ok({
        id: state.id.value,
        name: state.name,
        uf: state.uf
      })
    } catch (error) {
      return serverError(error as Error)
    }
  }
}
