import { Controller } from '@/presentation/protocols/controller'
import { HttpRequest, HttpResponse } from '@/presentation/protocols/http'
import { LoadCityById } from '@/domain/usecases/load-city-by-id'
import { ok, serverError, noContent } from '@/presentation/helpers/http-helper'

export class LoadCityByIdController implements Controller {
  constructor(private readonly loadCityById: LoadCityById) { }

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { id } = httpRequest.params as { id: string }
      const city = await this.loadCityById.load(id)
      if (!city) {
        return noContent()
      }
      return ok({
        id: city.id.value,
        name: city.name,
        stateId: city.stateId.value
      })
    } catch (error) {
      return serverError(error as Error)
    }
  }
}
